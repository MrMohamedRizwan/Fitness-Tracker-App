
select * from public."PlanAssignment";

select * from public."Client";
fd5b9806-dccc-4380-ba05-ae72def30ab7
99a01d46-9a9e-42e4-8374-3793d646e6e3

select * from public."Workout";

select * from public."DietPlans"


CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,         -- INSERT, UPDATE, DELETE
    record_id TEXT NOT NULL,         -- Primary key value as text
    changed_data JSONB,              -- Full row after change (or before in DELETE)
    changed_by TEXT,                 -- Who made the change
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
    pk_cols TEXT[];
    col TEXT;
    val TEXT;
    record_id_text TEXT := '';
    row_data JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        row_data := row_to_json(OLD)::jsonb;
    ELSE
        row_data := row_to_json(NEW)::jsonb;
    END IF;

    SELECT ARRAY_AGG(attname ORDER BY attnum)
    INTO pk_cols
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = TG_RELID AND i.indisprimary;

    IF pk_cols IS NOT NULL THEN
        FOREACH col IN ARRAY pk_cols LOOP
            val := COALESCE(
                CASE TG_OP
                    WHEN 'DELETE' THEN (row_to_json(OLD)::jsonb) ->> col
                    ELSE (row_to_json(NEW)::jsonb) ->> col
                END,
                'NULL'
            );
            record_id_text := record_id_text || col || '=' || quote_literal(val) || '; ';
        END LOOP;
        record_id_text := trim(trailing '; ' FROM record_id_text);
    ELSE
        record_id_text := '[NO PRIMARY KEY]';
    END IF;

    INSERT INTO audit_log (
        table_name,
        operation,
        record_id,
        changed_data,
        changed_by,
        changed_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        record_id_text,
        row_data,
        current_user,
        CURRENT_TIMESTAMP
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



DROP TRIGGER IF EXISTS trg_audit_PlanAssignment ON public."PlanAssignment";

CREATE TRIGGER trg_audit_PlanAssignment
AFTER INSERT OR UPDATE OR DELETE ON public."PlanAssignment"
FOR EACH ROW EXECUTE FUNCTION log_audit_changes();


DROP TRIGGER IF EXISTS trg_audit_Client ON public."Client";

CREATE TRIGGER trg_audit_Client
AFTER INSERT OR UPDATE OR DELETE ON public."Client"
FOR EACH ROW EXECUTE FUNCTION log_audit_changes();



DROP TRIGGER IF EXISTS trg_audit_Workout ON public."WorkoutPlan";

CREATE TRIGGER trg_audit_Workout
AFTER INSERT OR UPDATE OR DELETE ON public."WorkoutPlan"
FOR EACH ROW EXECUTE FUNCTION log_audit_changes();



DROP TRIGGER IF EXISTS trg_audit_DietPlans ON public."DietPlans";

CREATE TRIGGER trg_audit_DietPlans
AFTER INSERT OR UPDATE OR DELETE ON public."DietPlans"
FOR EACH ROW EXECUTE FUNCTION log_audit_changes();



select * from audit_log;