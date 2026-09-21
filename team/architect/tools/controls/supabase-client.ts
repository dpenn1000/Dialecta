// Known-answer control for ast-grep-rules/supabase-client-missing-database-type.yml.
// Not compiled or imported by anything; it exists so a rule change can be checked
// against lines whose answer is fixed. Expect exactly lines 6 and 7 to be flagged.
import { createClient as renamedFactory } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';
const untypedServer = createServerClient(url, key, {});
const untypedAliased = renamedFactory(url, key);
const typedServer = createServerClient<Database>(url, key, {});
const typedBrowser = createBrowserClient<Database>(url, key);
