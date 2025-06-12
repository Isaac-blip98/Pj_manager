DO $$ 
DECLARE
    v_admin_role_id UUID;
BEGIN
    -- Create admin role if it doesn't exist
    INSERT INTO roles (id, name, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'ADMIN'::"UserRole",   
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (name) DO UPDATE 
    SET updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_admin_role_id;

    -- Insert admin permissions
    INSERT INTO role_permissions (id, role_id, permission)
    SELECT 
        gen_random_uuid(),
        v_admin_role_id,
        p::"Permission"   
    FROM unnest(ARRAY[
        'READ_PROJECTS',
        'CREATE_PROJECTS',
        'UPDATE_PROJECTS',
        'DELETE_PROJECTS',
        'MANAGE_USERS',
        'MANAGE_PROJECTS'
    ]::"Permission"[]) AS p
    ON CONFLICT (role_id, permission) DO NOTHING;

    -- Create admin user if doesn't exist
    INSERT INTO users (
        id,
        name,
        email,
        password,
        role_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'System Administrator',
        'markndwiga@gmail.com',
        '$2a$12$TWQGg3BxdhueQwy3VU5L9e.PhgwNsrsFz5h02A795pJkYnUpazJy6',
        v_admin_role_id,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (email) DO NOTHING;

    -- Verify the setup
    IF NOT EXISTS (
        SELECT 1 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'ADMIN'::"UserRole" 
        AND u.email = 'markndwiga@gmail.com'
    ) THEN
        RAISE EXCEPTION 'Admin user setup failed';
    END IF;
END $$;