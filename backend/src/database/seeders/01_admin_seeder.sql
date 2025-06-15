DO $$ 
BEGIN
    -- Create admin user if doesn't exist
    INSERT INTO users (
        id,
        name,
        email,
        password,
        role,
        email_status,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'System Administrator',
        'markndwiga@gmail.com',
        '$2a$12$TWQGg3BxdhueQwy3VU5L9e.PhgwNsrsFz5h02A795pJkYnUpazJy6', 
        'ADMIN'::"UserRole",
        'NOT_SENT'::"EmailStatus",
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (email) DO NOTHING;

    -- Verify the setup
    IF NOT EXISTS (
        SELECT 1 
        FROM users 
        WHERE role = 'ADMIN'::"UserRole" 
        AND email = 'markndwiga@gmail.com'
    ) THEN
        RAISE EXCEPTION 'Admin user setup failed';
    END IF;
END $$;