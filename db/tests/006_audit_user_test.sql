BEGIN;

SET LOCAL app.username = 'audit_user_test';

CREATE TEMP TABLE audit_user_probe (
    id INTEGER PRIMARY KEY,
    payload TEXT
);

CREATE TRIGGER audit_user_probe_log
    AFTER INSERT OR UPDATE ON audit_user_probe
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log('id');

INSERT INTO audit_user_probe (id, payload)
VALUES (1, 'verify audit user');

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM audit_log
        WHERE table_name = 'audit_user_probe'
          AND action = 'ADD'
          AND record_key = '1'
          AND action_by = 'audit_user_test'
    ) THEN
        RAISE EXCEPTION 'audit_log did not record the configured user';
    END IF;
END;
$$;

ROLLBACK; 