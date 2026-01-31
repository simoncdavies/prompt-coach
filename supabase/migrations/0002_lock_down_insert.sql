-- Lock down INSERTs now that server uses service role
drop policy if exists "Enable insert for everyone" on "public"."prompt_runs";
