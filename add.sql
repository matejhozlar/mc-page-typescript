ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_name UNIQUE (name);

ALTER TABLE users 
ALTER COLUMN discord_id SET NOT NULL;

ALTER TABLE admins
ADD CONSTRAINT fk_admins_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE ai_message_log
ADD CONSTRAINT fk_ai_message_log_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE chat_tokens
ADD CONSTRAINT fk_chat_tokens_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE currency_transactions
ADD CONSTRAINT fk_currency_transactions_uuid
FOREIGN KEY (uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE currency_transactions
ADD CONSTRAINT fk_currency_transactions_to_uuid
FOREIGN KEY (to_uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE currency_transactions
ADD CONSTRAINT fk_currency_transactions_from_uuid
FOREIGN KEY (from_uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE daily_player_stats
ADD CONSTRAINT fk_daily_player_stats_uuid
FOREIGN KEY (uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE daily_playtime
ADD CONSTRAINT fk_daily_playtime_uuid
FOREIGN KEY (uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE daily_rewards
ADD CONSTRAINT fk_daily_rewards_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE lottery_participants
ADD CONSTRAINT fk_lottery_participants_uuid
FOREIGN KEY (uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE mob_limit_reached
ADD CONSTRAINT fk_mob_limit_reached_uuid
FOREIGN KEY (uuid)
REFERENCES users(uuid)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE ai_message_log ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE admins ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN first_joined SET NOT NULL;
ALTER TABLE admins ALTER COLUMN vanished SET NOT NULL;