
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  height_cm numeric(5,1),
  initial_weight_kg numeric(5,1),
  goal text NOT NULL DEFAULT '',
  start_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL DEFAULT auth.uid(),
  full_name text NOT NULL CHECK (length(trim(full_name)) > 0),
  phone text, email text, notes text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, coach_id)
);
CREATE INDEX students_coach_idx ON public.students(coach_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own students" ON public.students FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workouts
CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL DEFAULT auth.uid(),
  student_id uuid,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  workout_date date NOT NULL,
  start_time text,
  duration_minutes integer NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  muscle_groups text[] NOT NULL DEFAULT '{}',
  estimated_calories integer CHECK (estimated_calories IS NULL OR estimated_calories >= 0),
  status text NOT NULL DEFAULT 'planejado' CHECK (status IN ('concluido','nao_realizado','planejado')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, coach_id),
  FOREIGN KEY (student_id, coach_id) REFERENCES public.students(id, coach_id) ON DELETE SET NULL (student_id)
);
CREATE INDEX workouts_coach_date_idx ON public.workouts(coach_id, workout_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workouts" ON public.workouts FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER workouts_updated BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workout_exercises
CREATE TABLE public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_ref text,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  sets integer NOT NULL DEFAULT 1 CHECK (sets > 0),
  reps integer NOT NULL DEFAULT 1 CHECK (reps > 0),
  load_kg numeric(6,2) CHECK (load_kg IS NULL OR load_kg >= 0),
  rest_seconds integer CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  notes text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workout_exercises_workout_idx ON public.workout_exercises(workout_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_exercises TO authenticated;
GRANT ALL ON public.workout_exercises TO service_role;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workout exercises" ON public.workout_exercises FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.coach_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.coach_id = auth.uid()));

-- workout_logs
CREATE TABLE public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL DEFAULT auth.uid(),
  student_id uuid,
  workout_id uuid,
  log_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('presente','falta','cancelado')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (student_id, coach_id) REFERENCES public.students(id, coach_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id, coach_id) REFERENCES public.workouts(id, coach_id) ON DELETE SET NULL (workout_id)
);
CREATE INDEX workout_logs_coach_date_idx ON public.workout_logs(coach_id, log_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs" ON public.workout_logs FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

-- body_measurements
CREATE TABLE public.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL DEFAULT auth.uid(),
  measured_on date NOT NULL,
  weight_kg numeric(5,1), waist_cm numeric(5,1), abdomen_cm numeric(5,1), chest_cm numeric(5,1),
  hip_cm numeric(5,1), arm_cm numeric(5,1), thigh_cm numeric(5,1),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX body_measurements_coach_idx ON public.body_measurements(coach_id, measured_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own measurements" ON public.body_measurements FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER body_measurements_updated BEFORE UPDATE ON public.body_measurements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- financial_transactions
CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL DEFAULT auth.uid(),
  type text NOT NULL CHECK (type IN ('entrada','saida')),
  description text NOT NULL CHECK (length(trim(description)) > 0),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  transaction_date date NOT NULL,
  category text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX financial_transactions_coach_idx ON public.financial_transactions(coach_id, transaction_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO authenticated;
GRANT ALL ON public.financial_transactions TO service_role;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON public.financial_transactions FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER financial_transactions_updated BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
