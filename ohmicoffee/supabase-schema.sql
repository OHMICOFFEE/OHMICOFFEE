-- ============================================================
-- OHMI COFFEE CO. — COMPLETE SUPABASE SCHEMA v2
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- PRODUCTS
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  type text not null default 'single_origin',
  origin text, roast text, process text, masl text, body text,
  tasting_notes text, flavour_profile text,
  sca_score integer default 83,
  price_250g integer default 21000,
  price_500g integer default 34000,
  price_1kg integer default 58000,
  wholesale_250g integer default 13000,
  wholesale_500g integer default 21000,
  wholesale_1kg integer default 36000,
  image_url text default '',
  status text default 'active',
  stock_250g integer default 50,
  stock_500g integer default 30,
  stock_1kg integer default 20,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PACKAGES
create table if not exists packages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  once_off_fee integer not null,
  monthly_fee integer not null default 100000,
  direct_commission integer not null,
  wholesale_discount integer default 35,
  coffee_bags_included integer default 1,
  description text,
  features text[],
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- RANKS
create table if not exists ranks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  left_required integer not null,
  right_required integer not null,
  monthly_earnings integer not null,
  sort_order integer not null,
  badge_color text default '#C41E4A'
);

-- REPRESENTATIVES
create table if not exists representatives (
  id uuid default gen_random_uuid() primary key,
  auth_user_id uuid unique,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  phone text not null,
  id_number text,
  date_of_birth date,
  address_line1 text, address_line2 text,
  city text, province text, postal_code text,
  bank_name text, bank_account_number text,
  bank_branch_code text, bank_account_type text default 'cheque',
  crypto_wallet text, payout_method text default 'bank',
  kyc_status text default 'pending',
  id_document_url text, selfie_url text,
  kyc_submitted_at timestamptz, kyc_verified_at timestamptz,
  kyc_notes text,
  agreement_signed boolean default false,
  agreement_signed_at timestamptz,
  package_id uuid references packages(id),
  sponsor_id uuid references representatives(id),
  sponsor_name text,
  leg text default 'left',
  current_rank text default 'Unranked',
  status text default 'pending',
  is_active boolean default false,
  activated_at timestamptz,
  total_direct_commissions integer default 0,
  total_residual_commissions integer default 0,
  total_earned integer default 0,
  total_paid_out integer default 0,
  pending_payout integer default 0,
  left_team_count integer default 0,
  right_team_count integer default 0,
  personal_recruits integer default 0,
  meals_contributed integer default 0,
  rep_slug text unique,
  rep_site_bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BINARY TREE
create table if not exists binary_tree (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  parent_id uuid references representatives(id),
  leg text not null,
  depth integer default 0,
  path text,
  created_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  package_id uuid references packages(id),
  status text default 'active',
  next_billing_date date,
  last_paid_date date,
  monthly_amount integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COMMISSIONS
create table if not exists commissions (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  from_rep_id uuid references representatives(id),
  from_rep_name text,
  type text not null,
  amount integer not null,
  description text,
  week_ending date,
  status text default 'pending',
  paid_at timestamptz,
  payout_id uuid,
  created_at timestamptz default now()
);

-- PAYOUTS
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  rep_name text,
  amount integer not null,
  method text not null,
  bank_name text, bank_account text,
  crypto_wallet text,
  status text default 'pending',
  reference text,
  week_ending date not null,
  notes text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  rep_id uuid references representatives(id),
  rep_name text,
  order_type text default 'retail',
  items jsonb not null default '[]',
  subtotal integer default 0,
  shipping integer default 0,
  discount integer default 0,
  total integer not null default 0,
  status text default 'pending',
  payment_status text default 'pending',
  payment_reference text,
  payment_method text default 'ikhokha',
  shipping_address jsonb,
  tracking_number text,
  shipped_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CUSTOMERS
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  name text not null, email text not null unique, phone text,
  referred_by_rep uuid references representatives(id),
  total_orders integer default 0, total_spend integer default 0,
  created_at timestamptz default now()
);

-- KYC DOCUMENTS
create table if not exists kyc_documents (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  type text not null,
  url text not null,
  status text default 'pending',
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz default now()
);

-- AGREEMENTS
create table if not exists agreements (
  id uuid default gen_random_uuid() primary key,
  rep_id uuid not null references representatives(id),
  version text default '1.0',
  signed_at timestamptz default now(),
  ip_address text, signature_data text,
  full_name text, id_number text
);

-- SITE SETTINGS
create table if not exists site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text not null,
  label text,
  updated_at timestamptz default now()
);

-- FOUNDATION
create table if not exists foundation_entries (
  id uuid default gen_random_uuid() primary key,
  meals_count integer not null,
  kitchen_name text, notes text,
  recorded_by text default 'admin',
  created_at timestamptz default now()
);

-- MEDIA
create table if not exists media (
  id uuid default gen_random_uuid() primary key,
  name text not null, url text not null,
  bucket text default 'products',
  size_bytes integer, mime_type text,
  linked_to text,
  created_at timestamptz default now()
);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into packages (name, once_off_fee, monthly_fee, direct_commission, wholesale_discount, coffee_bags_included, description, features, sort_order) values
('Starter', 100000, 100000, 25000, 30, 1, 'Begin your OHMI journey.', ARRAY['1 coffee bag monthly','Binary network position','R250 direct commission','30% wholesale discount','Rep portal access','Replicated website'], 1),
('Builder', 200000, 100000, 50000, 40, 2, 'Build your network faster.', ARRAY['2 coffee bags monthly','Binary network position','R500 direct commission','40% wholesale discount','Priority placement','Leaderboard access'], 2),
('Elite', 500000, 100000, 100000, 50, 5, 'Maximum earning potential.', ARRAY['5 coffee bags monthly','Binary network position','R1,000 direct commission','50% wholesale discount','White-label rep site','VIP support','Priority payouts'], 3);

insert into ranks (name, left_required, right_required, monthly_earnings, sort_order, badge_color) values
('Qualified Representative', 2, 2, 800, 1, '#C41E4A'),
('Rising Star', 5, 5, 2000, 2, '#C41E4A'),
('One Star Representative', 10, 10, 4000, 3, '#C41E4A'),
('Two Star Representative', 20, 20, 8000, 4, '#C41E4A'),
('Four Star Representative', 40, 40, 16000, 5, '#C41E4A'),
('Regional Representative', 75, 75, 30000, 6, '#B8860B'),
('National Representative', 150, 150, 60000, 7, '#B8860B'),
('Crowned Director', 200, 200, 80000, 8, '#B8860B'),
('Emerald Director', 250, 250, 100000, 9, '#50C878'),
('Sapphire Director', 300, 300, 120000, 10, '#0F52BA'),
('Diamond Director', 350, 350, 140000, 11, '#B9F2FF'),
('Black Diamond Director', 400, 400, 160000, 12, '#333333'),
('Double Crown Diamond', 450, 450, 180000, 13, '#FFD700'),
('Sovereign Crown Leader', 500, 500, 200000, 14, '#FFD700');

insert into products (name, slug, type, origin, roast, process, masl, body, tasting_notes, flavour_profile, sca_score, price_250g, price_500g, price_1kg, wholesale_250g, wholesale_500g, wholesale_1kg, status, sort_order) values
('Gorgeous Guatemala','gorgeous-guatemala','single_origin','TMO','Medium Roast','Washed Bourbon','1350m','Full Body, Medium Acidity','Chocolatey berries with sweet nutty undertones','Full, round body with dark chocolate, almonds, and red berries.',83,21000,34000,58000,13000,21000,36000,'active',1),
('Crown of Colombia','crown-of-colombia','single_origin','Excelso Antioquia','Medium Roast','Washed Bourbon','2100m','Med Body, Med Acidity','Chocolatey caramel with fruity undertones','Sweet, chocolatey flavors with caramel, apple, and red fruit notes.',86,22000,36000,61000,14000,22000,38000,'active',2),
('Heartfelt Honduras','heartfelt-honduras','single_origin','Las Nubes','Medium Roast','Washed Bourbon','1350m','Full Body, Med Acidity','Chocolatey vanilla & hazelnut undertones','Full-bodied with dark chocolate, molasses, and a hint of spice.',89,24000,38000,64000,15000,24000,40000,'active',3),
('Kiss of Kenya','kiss-of-kenya','single_origin','Kirinyaga','Medium Roast','Washed Bourbon','1700-1900m','Full Body, Med Acidity','Fragrant aromas with floral undertones','Full body, pleasant acidity, rich flavor and fragrant floral aromas.',83,21500,35000,59000,13500,21500,37000,'active',4),
('Elegant Ethiopia','elegant-ethiopia','single_origin','Yirgacheffe','Dark Roast','Washed Bourbon','1900-2100m','Full Body, Med Acidity','Fruity wine with complex blueberry notes','Fruity or winey tones, complex blueberry notes, bright acidity.',85,23000,37000,62000,14500,23000,39000,'active',5),
('Brilliant Burundi','brilliant-burundi','single_origin','Bugisu','Light Roast','Natural Bourbon','1700-2100m','Rich Body, Bright Acidity','Sweet & fruity with floral undertones','Full-bodied with dark chocolate and molasses, sweet finish.',87,22500,36000,61000,14000,22500,38000,'active',6),
('Uniquely Uganda','uniquely-uganda','single_origin','Bugisu','Med/Dark Roast','Washed Bourbon','1300-2200m','Smooth Body, Bal Acidity','Sweet & savoury dark chocolate with nuts','Dark chocolate, molasses, spice — rich smooth mouthfeel.',85,21500,35000,59000,13500,21500,37000,'active',7),
('Radiant Rwanda','radiant-rwanda','single_origin','Isimbi','Dark Roast','Washed Bourbon','1700-2100m','Smooth Body, Bal Acidity','Caramely & spicy citrus with berry undertones','Light citrus, spice, berry — silky creamy body with caramel aromas.',85,21800,35500,59500,13500,21800,37000,'active',8),
('Amarula Bliss','amarula-bliss','infused','TMO','Medium Roast','Washed Bourbon','1350m','Full Body, Medium Acidity','Marula fruit cream with citrus notes','Full-bodied, rich mouthfeel with Marula fruit cream and citrus.',83,22000,35500,60000,13500,22000,37500,'active',9),
('Golden Toffee','golden-toffee','infused','TMO','Medium Roast','Washed Bourbon','1350m','Full Body, Medium Acidity','Decadent toffee and caramel notes','Full-bodied with decadent toffee and caramel, lingering sweet finish.',83,21000,34000,58000,13000,21000,36000,'active',10);

insert into site_settings (key, value, label) values
('meals_served','255','Total Meals Served'),
('marquee_text','Brew Good · Do Good · From Our Cup To Their Cup · 255 Meals Served · Single Origin · Specialty Coffee · 100% Arabica · South Africa','Marquee Text'),
('foundation_story','At OHMI, we are on a mission to bring the most delicious Single Origin coffees to South Africa while making a real difference for children in need. With every purchase, 20% of profits go to our partnered soup kitchens and community churches. Join us in brewing hope and spreading joy with every sip.','Foundation Story'),
('commission_matching_rate','10','Matching Bonus Rate (%)'),
('payout_minimum','20000','Minimum Payout (ZAR cents)'),
('buyback_days','7','Buyback Guarantee Days'),
('site_status','live','Site Status');

insert into storage.buckets (id, name, public) values
('products','products',true),
('kyc','kyc',false),
('rep-sites','rep-sites',true),
('media','media',true)
on conflict do nothing;

-- RLS
alter table products enable row level security;
alter table packages enable row level security;
alter table ranks enable row level security;
alter table representatives enable row level security;
alter table binary_tree enable row level security;
alter table subscriptions enable row level security;
alter table commissions enable row level security;
alter table payouts enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table kyc_documents enable row level security;
alter table agreements enable row level security;
alter table site_settings enable row level security;
alter table foundation_entries enable row level security;
alter table media enable row level security;

create policy "pub_read_products" on products for select using (status = 'active');
create policy "pub_read_packages" on packages for select using (is_active = true);
create policy "pub_read_ranks" on ranks for select using (true);
create policy "pub_read_settings" on site_settings for select using (true);
create policy "pub_read_tree" on binary_tree for select using (true);
create policy "svc_products" on products for all using (auth.role() = 'service_role');
create policy "svc_packages" on packages for all using (auth.role() = 'service_role');
create policy "svc_ranks" on ranks for all using (auth.role() = 'service_role');
create policy "svc_reps" on representatives for all using (auth.role() = 'service_role');
create policy "svc_tree" on binary_tree for all using (auth.role() = 'service_role');
create policy "svc_subs" on subscriptions for all using (auth.role() = 'service_role');
create policy "svc_comms" on commissions for all using (auth.role() = 'service_role');
create policy "svc_payouts" on payouts for all using (auth.role() = 'service_role');
create policy "svc_orders" on orders for all using (auth.role() = 'service_role');
create policy "svc_customers" on customers for all using (auth.role() = 'service_role');
create policy "svc_kyc" on kyc_documents for all using (auth.role() = 'service_role');
create policy "svc_agreements" on agreements for all using (auth.role() = 'service_role');
create policy "svc_settings" on site_settings for all using (auth.role() = 'service_role');
create policy "svc_foundation" on foundation_entries for all using (auth.role() = 'service_role');
create policy "svc_media" on media for all using (auth.role() = 'service_role');

-- RANK CALCULATOR FUNCTION
create or replace function calculate_rank(l integer, r integer)
returns text language plpgsql as $$
begin
  if l>=500 and r>=500 then return 'Sovereign Crown Leader';
  elsif l>=450 and r>=450 then return 'Double Crown Diamond';
  elsif l>=400 and r>=400 then return 'Black Diamond Director';
  elsif l>=350 and r>=350 then return 'Diamond Director';
  elsif l>=300 and r>=300 then return 'Sapphire Director';
  elsif l>=250 and r>=250 then return 'Emerald Director';
  elsif l>=200 and r>=200 then return 'Crowned Director';
  elsif l>=150 and r>=150 then return 'National Representative';
  elsif l>=75 and r>=75 then return 'Regional Representative';
  elsif l>=40 and r>=40 then return 'Four Star Representative';
  elsif l>=20 and r>=20 then return 'Two Star Representative';
  elsif l>=10 and r>=10 then return 'One Star Representative';
  elsif l>=5 and r>=5 then return 'Rising Star';
  elsif l>=2 and r>=2 then return 'Qualified Representative';
  else return 'Unranked';
  end if;
end;
$$;

create or replace function get_residual_income(l integer, r integer)
returns integer language plpgsql as $$
begin
  if l>=500 and r>=500 then return 200000;
  elsif l>=450 and r>=450 then return 180000;
  elsif l>=400 and r>=400 then return 160000;
  elsif l>=350 and r>=350 then return 140000;
  elsif l>=300 and r>=300 then return 120000;
  elsif l>=250 and r>=250 then return 100000;
  elsif l>=200 and r>=200 then return 80000;
  elsif l>=150 and r>=150 then return 60000;
  elsif l>=75 and r>=75 then return 30000;
  elsif l>=40 and r>=40 then return 16000;
  elsif l>=20 and r>=20 then return 8000;
  elsif l>=10 and r>=10 then return 4000;
  elsif l>=5 and r>=5 then return 2000;
  elsif l>=2 and r>=2 then return 800;
  else return 0;
  end if;
end;
$$;
