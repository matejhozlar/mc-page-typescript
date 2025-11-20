ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_name UNIQUE (name);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT unique_channel_id UNIQUE (channel_id);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT unique_admin_message_id UNIQUE (admin_message_id);

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT unique_ticker_number UNIQUE (ticket_number);

ALTER TABLE users 
ALTER COLUMN discord_id SET NOT NULL;

ALTER TABLE company_edits
ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE company_edits
ALTER COLUMN editor_uuid SET NOT NULL;

ALTER TABLE company_edits
ALTER COLUMN reviewed_by SET NOT NULL;

ALTER TABLE company_edits
ALTER COLUMN created_at SET NOT NULL;


ALTER TABLE chat_tokens
ALTER COLUMN discord_name SET NOT NULL;

ALTER TABLE crypto_tokens
ALTER COLUMN is_memecoin SET NOT NULL;

ALTER TABLE token_price_history_minutes
ALTER COLUMN recorded_at SET NOT NULL;

ALTER TABLE token_price_history_hourly
ALTER COLUMN recorded_at SET NOT NULL;

ALTER TABLE token_price_history_daily
ALTER COLUMN recorded_at SET NOT NULL;

ALTER TABLE token_price_history_weekly
ALTER COLUMN recorded_at SET NOT NULL;

ALTER TABLE token_price_alerts
ALTER COLUMN direction SET NOT NULL;

ALTER TABLE user_portfolio_history
ALTER COLUMN recorded_at SET NOT NULL;

ALTER TABLE company_balance_history
ALTER COLUMN company_id SET NOT NULL;

ALTER TABLE company_interest_ledger
ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE company_members
ALTER COLUMN joined_at SET NOT NULL;

ALTER TABLE company_members
ALTER COLUMN role SET NOT NULL;

ALTER TABLE companies
ALTER COLUMN founder_uuid SET NOT NULL;

ALTER TABLE companies
ALTER COLUMN created_at SET NOT NULL;

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

ALTER TABLE rcon_logs
ADD CONSTRAINT fk_rcon_logs_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE tickets
ADD CONSTRAINT fk_tickets_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE token_price_alerts
ADD CONSTRAINT fk_token_price_alerts_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE token_price_alerts
ADD CONSTRAINT fk_token_price_alerts_token_symbol
FOREIGN KEY (token_symbol)
REFERENCES crypto_tokens(symbol)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE user_portfolio_history
ADD CONSTRAINT fk_user_portfolio_history_discord_id
FOREIGN KEY (discord_id)
REFERENCES users(discord_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE tickets
ADD CONSTRAINT fk_user_tickets_mc_name
FOREIGN KEY (mc_name)
REFERENCES users(name)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE ai_message_log ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE admins ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN first_joined SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN mc_name SET NOT NULL;
ALTER TABLE admins ALTER COLUMN vanished SET NOT NULL;
ALTER TABLE users 
ALTER COLUMN session_start SET DEFAULT NULL;