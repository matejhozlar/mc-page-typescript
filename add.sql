ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_name UNIQUE (name);

ALTER TABLE users 
ALTER COLUMN discord_id SET NOT NULL;