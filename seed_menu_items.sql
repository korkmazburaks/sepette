-- ═══════════════════════════════════════════════════════════════════════════
-- Sepette — Menu Items Seed Script
--
-- Kullanım: Supabase SQL Editor'a yapıştır → Run
-- Idempotent: Önce siler, sonra tekrar ekler (birden fazla çalıştırılabilir)
-- Önkoşul: restaurants tablosunda ilgili slug'lar mevcut olmalı
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- 1. LA MILA  (slug: la-mila)  — 87 ürün
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE slug = 'la-mila';
  IF rid IS NULL THEN
    RAISE NOTICE '[SKIP] la-mila bulunamadı — restaurants tablosuna ekleyin';
    RETURN;
  END IF;

  DELETE FROM menu_items WHERE restaurant_id = rid;

  INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, available, position) VALUES
    -- Antipasti - Vorspeise
    (rid, 'Antipasti - Vorspeise', 'Pizzabrot',            'Frisch aus dem Ofen mit Tomatensauce und einer Zutat nach Wahl',                                                                         5.70, 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&q=80', true,  1),
    (rid, 'Antipasti - Vorspeise', 'Bruschetta (2 Stück)', 'Knuspriges Ciabatta mit Olivenöl, Knoblauch, Tomatenwürfeln und Balsamicocreme',                                                         5.90, 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400&q=80', true,  2),
    (rid, 'Antipasti - Vorspeise', 'Caprese',              'Mit Tomaten, Mozzarella, Basilikum und Balsamicocreme',                                                                                  9.90, 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&q=80', true,  3),
    (rid, 'Antipasti - Vorspeise', 'Antipasti Teller',     'Mit Caprese, Grillgemüse, Oliven, Pilzen und 3 hausgemachten Pizzabrötchen',                                                            11.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', true,  4),
    -- Salate
    (rid, 'Salate', 'Salat Mista',          'Mit Cherrytomaten, roten Zwiebeln, Gurken und Oliven',                                                                                                  6.90, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', true,  5),
    (rid, 'Salate', 'Salat Feta e Pomodori','Mit Cherrytomaten, Rucola, Feta, Gurken, Oliven und Balsamicocreme',                                                                                   11.90, NULL, true,  6),
    (rid, 'Salate', 'Salat Tonno',          'Mit Thunfisch, Cherrytomaten, roten Zwiebeln, Gurken und Oliven',                                                                                      11.90, NULL, true,  7),
    (rid, 'Salate', 'Salat Gamberetti',     'Mit gegrillten Garnelen, Cherrytomaten, Lauchzwiebeln, Gurken und Oliven',                                                                             13.90, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', true,  8),
    (rid, 'Salate', 'Salat Caesare',        'Mit gegrillter Hähnchenbrust, Cherrytomaten, Lauchzwiebeln, Gurken, Oliven, Brotcroutons, Hartkäse und Caesare-Dressing',                             13.90, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80', true,  9),
    (rid, 'Salate', 'Salat Pollo Speciale', 'Mit gegrillten Hähnchenbruststreifen, Cherrytomaten, Lauchzwiebeln, Champignons und Gurken',                                                          13.90, NULL, true, 10),
    (rid, 'Salate', 'Salat Molto Sole',     'Mit Penne, gemischtem Gemüse, Tomatenwürfeln, Rucola, Oliven, Pinienkernen und Balsamicocreme',                                                       11.90, NULL, true, 11),
    -- Pizza
    (rid, 'Pizza', 'Pizza Margherita',            'Mit Tomatensauce und Käse',                                                                                                                       9.50, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', true, 12),
    (rid, 'Pizza', 'Pizza Vegetariana',           'Mit Grillgemüse und Rucola',                                                                                                                     12.70, NULL, true, 13),
    (rid, 'Pizza', 'Pizza Bruschetta',            'Mit Tomatenwürfeln, italienischem Hartkäse und Rucola',                                                                                          12.90, NULL, true, 14),
    (rid, 'Pizza', 'Pizza Caprese',               'Mit Fleischtomaten und frischem Basilikum',                                                                                                      12.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', true, 15),
    (rid, 'Pizza', 'Pizza Burrata',               'Mit Mozzarellascheiben, Cherrytomaten und Burrata',                                                                                              14.70, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', true, 16),
    (rid, 'Pizza', 'Pizza Quattro Formaggi',      'Mit Gorgonzola, italienischem Hartkäse und Parmesan, ohne Tomatensauce',                                                                         13.90, NULL, true, 17),
    (rid, 'Pizza', 'Pizza Spinaci e Gorgonzola',  'Mit Gorgonzola, Cherrytomaten und Babyspinat, ohne Tomatensauce',                                                                                14.70, NULL, true, 18),
    (rid, 'Pizza', 'Pizza Salami',                'Mit Tomatensauce, Käse und Salami',                                                                                                              12.70, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', true, 19),
    (rid, 'Pizza', 'Pizza Prosciutto',            'Mit Schinken',                                                                                                                                   12.90, NULL, true, 20),
    (rid, 'Pizza', 'Pizza Funghi',                'Mit frischen Champignons',                                                                                                                       12.70, NULL, true, 21),
    (rid, 'Pizza', 'Pizza Roma',                  'Mit Schinken und frischen Champignons',                                                                                                          13.70, NULL, true, 22),
    (rid, 'Pizza', 'Pizza Anna Maria',            'Mit Schinken und Zwiebeln',                                                                                                                      13.70, NULL, true, 23),
    (rid, 'Pizza', 'Pizza Hawaii',                'Mit Schinken und Ananas',                                                                                                                        13.90, NULL, true, 24),
    (rid, 'Pizza', 'Pizza Speciale',              'Mit Salami, Schinken, Pilze und frischen Tomaten',                                                                                               14.90, NULL, true, 25),
    (rid, 'Pizza', 'Pizza Quattro Stagioni',      'Mit Peperonisalami, Schinken, Artischocken und Champignons',                                                                                     15.90, NULL, true, 26),
    (rid, 'Pizza', 'Pizza Pommes',                'Mit Pommes frites',                                                                                                                              12.70, NULL, true, 27),
    (rid, 'Pizza', 'Pizza Diavolo',               'Mit Peperonisalami',                                                                                                                             14.90, NULL, true, 28),
    (rid, 'Pizza', 'Pizza Pollo con Pesto',       'Mit grünem Pesto, gegrillten Hähnchenbruststreifen, Cherrytomaten, Rucola und frischen Champignons',                                            15.90, NULL, true, 29),
    (rid, 'Pizza', 'Pizza Tonno',                 'Mit Thunfisch und roten Zwiebeln',                                                                                                               13.90, NULL, true, 30),
    (rid, 'Pizza', 'Pizza Gamberetti',            'Mit Garnelen, Cherrytomaten, Rucola und Oliven',                                                                                                 15.90, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&q=80', true, 31),
    (rid, 'Pizza', 'Pizza Parma',                 'Mit Parmaschinken, Rucola und italienischem Hartkäse',                                                                                           15.90, NULL, true, 32),
    (rid, 'Pizza', 'Pizza LaMila',                'Mit Parmaschinken, Rucola, italienischem Hartkäse und Ricottarand',                                                                              16.70, NULL, true, 33),
    (rid, 'Pizza', 'Pizza Calzone 1',             'Gefüllte Pizza',                                                                                                                                 10.90, NULL, true, 34),
    (rid, 'Pizza', 'Pizza Calzone 2',             'Gefüllte Pizza mit Schinken, Salami und frischen Champignons',                                                                                   14.90, NULL, true, 35),
    (rid, 'Pizza', 'Pizza Salsiccia Piccante',    'Scharfe Salsiccia (italienische Wurst) mit Peperoncino – würzig und leicht scharf',                                                              15.90, NULL, true, 36),
    -- Party Pizza 60×40cm
    (rid, 'Party Pizza 60×40cm', 'Party Pizza Margherita', '60×40 cm – Mit Tomatensauce und Käse',                                                                                                  25.00, NULL, true, 37),
    (rid, 'Party Pizza 60×40cm', 'Party Pizza Salami',     '60×40 cm',                                                                                                                              27.50, NULL, true, 38),
    (rid, 'Party Pizza 60×40cm', 'Party Pizza Schinken',   '60×40 cm',                                                                                                                              28.50, NULL, true, 39),
    -- Pasta
    (rid, 'Pasta', 'Lasagne Classic',               'Geschichtete Teigplatten mit Rinderhackfleischsauce und Mozzarella überbacken',                                                                12.90, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80', true, 40),
    (rid, 'Pasta', 'Spaghetti Bolognese',           'Mit Hackfleischsauce',                                                                                                                         11.90, 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&q=80', true, 41),
    (rid, 'Pasta', 'Spaghetti Carbonara',           'Mit Sahnesauce, Speck, Ei und Parmesan',                                                                                                       12.70, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80', true, 42),
    (rid, 'Pasta', 'Spaghetti Aglio e Olio',        'Mit Olivenöl, Knoblauch, Chili, Lauchzwiebeln und Cherrytomaten',                                                                              10.70, NULL, true, 43),
    (rid, 'Pasta', 'Spaghetti al Pesto',            'Mit grünem Pesto, Cherrytomaten und Pinienkernen',                                                                                             14.70, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80', true, 44),
    (rid, 'Pasta', 'Spaghetti Gamberetti',          'Mit einer Sauce nach Wahl, gegrillten Garnelen und Cherrytomaten',                                                                             14.90, NULL, true, 45),
    (rid, 'Pasta', 'Spaghetti Napoli',              'Mit fruchtiger Tomatensauce',                                                                                                                   9.50, NULL, true, 46),
    (rid, 'Pasta', 'Penne Speciale',                'Mit Tomatensauce, gegrillten Hähnchenbruststreifen, Lauchzwiebeln und frischen Champignons',                                                   13.90, NULL, true, 47),
    (rid, 'Pasta', 'Penne all Arrabbiata',          'Mit pikanter Tomatensauce, Cherrytomaten und Lauchzwiebeln',                                                                                   12.90, NULL, true, 48),
    (rid, 'Pasta', 'Penne Seyfa',                   'Mit Tomatensauce, frischen Champignons und Chili-Olivenöl',                                                                                    11.50, NULL, true, 49),
    (rid, 'Pasta', 'Penne Salmone',                 'Mit Sahnesauce, Lachs, Cherrytomaten und Lauchzwiebeln',                                                                                       14.90, NULL, true, 50),
    (rid, 'Pasta', 'Penne Verdura',                 'Mit fruchtiger Tomatensauce, Grillgemüse, Rucola und Pinienkernen',                                                                            12.90, NULL, true, 51),
    (rid, 'Pasta', 'Penne Quattro Formaggi',        'Mit Sahnesauce, Gorgonzola, italienischem Hartkäse, Mozzarella und Parmesan',                                                                  13.90, NULL, true, 52),
    (rid, 'Pasta', 'Gnocchi alla Napoletana',       'Mit fruchtiger Tomatensauce und Mozzarella überbacken',                                                                                        11.50, NULL, true, 53),
    (rid, 'Pasta', 'Gnocchi Spinaci e Gorgonzola',  'Mit Gorgonzola-Sahnesauce, Babyspinat und Cherrytomaten',                                                                                      12.90, NULL, true, 54),
    (rid, 'Pasta', 'Tortellini alla Panna',         'Mit cremiger Sahnesauce und Schinken',                                                                                                         12.50, NULL, true, 55),
    -- Burger
    (rid, 'Burger', 'Classic Cheeseburger',   'Mit Rindfleisch, Salat, roten Zwiebeln, Käse und LaMila Spezialsauce',                                                                              11.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', true, 56),
    (rid, 'Burger', 'Chilli Cheeseburger',    'Mit Rindfleisch, Salat, Tomate, roten Zwiebeln, Jalapeños und Chilli Cheese Sauce',                                                                 14.90, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80', true, 57),
    (rid, 'Burger', 'Chicken Crunchy Burger', 'Mit Salat, Tomate und knusprigem Chicken',                                                                                                          12.90, NULL, true, 58),
    (rid, 'Burger', 'BBQ Burger',             'Mit Rindfleisch, Salat, roten Zwiebeln, Käse, Bacon und Barbecuesauce',                                                                             12.90, NULL, true, 59),
    (rid, 'Burger', 'Veggie Burger',          'Aus sonnengereiftem und unreifem Gemüse mit einer leichten Meerrettichnote',                                                                        11.50, NULL, true, 60),
    (rid, 'Burger', 'Burger Tre Formaggi',    'Mit Rindfleisch, Rucola, Hartkäse, Feta und Gorgonzolacreme',                                                                                       12.90, NULL, true, 61),
    (rid, 'Burger', 'LaMila Burger',          'Mit Rindfleisch, Salat, Balsamico-Zwiebeln, Käse und LaMila Spezialsauce',                                                                          12.90, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80', true, 62),
    (rid, 'Burger', 'Pesto Deluxe Burger',    'Saftiger Rindfleischburger mit Pesto, geschmolzenem Mozzarella, Rucola und Tomaten im Brioche-Bun',                                                 14.90, NULL, true, 63),
    -- Schnitzelvariante
    (rid, 'Schnitzelvariante', 'Putenschnitzel',   'Mit Pommes und Salat',                                                                                                                         11.90, NULL, true, 64),
    (rid, 'Schnitzelvariante', 'Schweineschnitzel','Aus Schweinefleisch, mit Pommes und Salat',                                                                                                     13.90, 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&q=80', true, 65),
    -- Fingerfood
    (rid, 'Fingerfood', 'Pommes frites',                   NULL, 5.50, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80', true, 66),
    (rid, 'Fingerfood', 'Cheese Pommes frites',            NULL, 6.50, NULL, true, 67),
    (rid, 'Fingerfood', 'Süßkartoffel Pommes frites',      NULL, 6.00, NULL, true, 68),
    (rid, 'Fingerfood', 'Kartoffel Wedges',                NULL, 6.50, NULL, true, 69),
    (rid, 'Fingerfood', 'Mozzarella Sticks (6 Stück)',     NULL, 6.00, NULL, true, 70),
    (rid, 'Fingerfood', 'Panierte Zwiebelringe (6 Stück)', NULL, 4.90, NULL, true, 71),
    (rid, 'Fingerfood', 'Nuggets (6 Stück)',               NULL, 6.00, NULL, true, 72),
    (rid, 'Fingerfood', 'Hot Wings',                       '6 Hot Chicken Wings', 6.90, NULL, true, 73),
    (rid, 'Fingerfood', 'Chicken Wings',                   '6 Chicken Wings',     7.90, NULL, true, 74),
    (rid, 'Fingerfood', 'Chili Cheese Pommes',             'Pommes mit Chili, Cheese Sauce und Jalapeños', 9.90, NULL, true, 75),
    -- Desserts
    (rid, 'Desserts', 'Tiramisu',           'Mit Mascarponecreme, Kaffee, Biskuit und Kakao',         5.90, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', true, 76),
    (rid, 'Desserts', 'Souffle Schoko',     'Schoko-Soufflé – außen fest und innen flüssig',          6.90, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', true, 77),
    (rid, 'Desserts', 'Pistazienkuchen',    'Hausgemachter, super saftiger Pistazienkuchen',          6.90, NULL, true, 78),
    (rid, 'Desserts', 'Schokoladen-Éclair', 'Ein klassischer Genuss – frisch, cremig und unwiderstehlich', 6.90, NULL, true, 79),
    -- Softdrinks & Getränke
    (rid, 'Softdrinks & Getränke', 'Coca-Cola',      '0,33 l', 3.50, NULL, true, 80),
    (rid, 'Softdrinks & Getränke', 'Coca-Cola Zero', '0,33 l', 3.50, NULL, true, 81),
    (rid, 'Softdrinks & Getränke', 'Fanta',          '0,33 l', 3.50, NULL, true, 82),
    (rid, 'Softdrinks & Getränke', 'Sprite',         '0,33 l', 3.50, NULL, true, 83),
    (rid, 'Softdrinks & Getränke', 'Wasser Still',   '0,5 l',  2.50, NULL, true, 84),
    (rid, 'Softdrinks & Getränke', 'Wasser Sprudel', '0,5 l',  2.50, NULL, true, 85),
    (rid, 'Softdrinks & Getränke', 'Apfelschorle',   '0,33 l', 3.00, NULL, true, 86),
    (rid, 'Softdrinks & Getränke', 'Eistee',         '0,33 l', 3.00, NULL, true, 87);

  RAISE NOTICE '[OK] la-mila: % ürün eklendi', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = rid);
END $$;


-- ─────────────────────────────────────────────────────────────
-- 2. PIZZA PALACE  (slug: pizza-palace-ulm)  — 8 ürün
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE slug = 'pizza-palace-ulm';
  IF rid IS NULL THEN RAISE NOTICE '[SKIP] pizza-palace-ulm bulunamadı'; RETURN; END IF;

  DELETE FROM menu_items WHERE restaurant_id = rid;

  INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, available, position) VALUES
    (rid, 'Pizza',    'Margherita',           'Tomatensauce, Mozzarella, Basilikum',                8.90, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', true, 1),
    (rid, 'Pizza',    'Salami Piccante',       'Tomatensauce, Mozzarella, scharfe Salami',          11.90, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', true, 2),
    (rid, 'Pizza',    'Tonno e Cipolla',       'Thunfisch, rote Zwiebeln, Mozzarella',              12.50, NULL, true, 3),
    (rid, 'Pizza',    'Quattro Stagioni',      'Schinken, Champignons, Artischocken, Paprika',      13.90, NULL, true, 4),
    (rid, 'Pasta',    'Spaghetti Bolognese',   'Klassische Hackfleischsauce',                       10.90, 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&q=80', true, 5),
    (rid, 'Pasta',    'Penne Arrabbiata',      'Pikante Tomatensauce, Knoblauch, Chili',             9.90, NULL, true, 6),
    (rid, 'Getränke', 'Coca-Cola 0,33 l',      NULL,                                                 3.00, NULL, true, 7),
    (rid, 'Getränke', 'Wasser 0,5 l',          NULL,                                                 2.00, NULL, true, 8);

  RAISE NOTICE '[OK] pizza-palace-ulm: % ürün eklendi', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = rid);
END $$;


-- ─────────────────────────────────────────────────────────────
-- 3. BURGER HOUSE  (slug: burger-house-ulm)  — 9 ürün
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE slug = 'burger-house-ulm';
  IF rid IS NULL THEN RAISE NOTICE '[SKIP] burger-house-ulm bulunamadı'; RETURN; END IF;

  DELETE FROM menu_items WHERE restaurant_id = rid;

  INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, available, position) VALUES
    (rid, 'Burger',   'Classic Burger',      'Rindfleisch, Salat, Tomate, Zwiebeln, Ketchup',                    9.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', true, 1),
    (rid, 'Burger',   'Double Smash Burger', 'Zwei Smash-Patties, Cheddar, Speck, Spezialsauce',                13.90, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80', true, 2),
    (rid, 'Burger',   'Chicken Crispy',      'Knuspriges Hähnchenfilet, Coleslaw, Honig-Senf',                  10.90, NULL, true, 3),
    (rid, 'Burger',   'Veggie Mushroom',     'Pilz-Patty, Avocado, Rucola, Aioli',                               9.90, NULL, true, 4),
    (rid, 'Beilagen', 'Pommes frites',       NULL,                                                                3.90, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80', true, 5),
    (rid, 'Beilagen', 'Onion Rings',         '6 Stück',                                                          4.50, NULL, true, 6),
    (rid, 'Beilagen', 'Coleslaw',            NULL,                                                                2.90, NULL, true, 7),
    (rid, 'Getränke', 'Coca-Cola 0,33 l',    NULL,                                                                2.90, NULL, true, 8),
    (rid, 'Getränke', 'Milkshake Vanilla',   NULL,                                                                4.50, NULL, true, 9);

  RAISE NOTICE '[OK] burger-house-ulm: % ürün eklendi', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = rid);
END $$;


-- ─────────────────────────────────────────────────────────────
-- 4. SUSHI GARDEN  (slug: sushi-garden-ulm)  — 9 ürün
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE slug = 'sushi-garden-ulm';
  IF rid IS NULL THEN RAISE NOTICE '[SKIP] sushi-garden-ulm bulunamadı'; RETURN; END IF;

  DELETE FROM menu_items WHERE restaurant_id = rid;

  INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, available, position) VALUES
    (rid, 'Nigiri & Sashimi', 'Lachs Nigiri (2 Stück)',    'Frischer Lachs auf Sushi-Reis',                5.90, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', true, 1),
    (rid, 'Nigiri & Sashimi', 'Thunfisch Nigiri (2 Stück)','Frischer Thunfisch auf Sushi-Reis',            6.50, NULL, true, 2),
    (rid, 'Nigiri & Sashimi', 'Lachs Sashimi (5 Stück)',   'Premium Lachs, ohne Reis',                    11.90, NULL, true, 3),
    (rid, 'Maki & Rolls',     'California Roll (8 Stück)', 'Surimi, Avocado, Gurke',                       9.90, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80', true, 4),
    (rid, 'Maki & Rolls',     'Spicy Tuna Roll (8 Stück)', 'Thunfisch, Sriracha, Gurke',                  11.90, NULL, true, 5),
    (rid, 'Maki & Rolls',     'Dragon Roll (8 Stück)',     'Garnelen Tempura, Avocado, Aal-Sauce',         13.90, NULL, true, 6),
    (rid, 'Maki & Rolls',     'Veggie Roll (8 Stück)',     'Gurke, Avocado, Karotte, Ingwer',              8.90, NULL, true, 7),
    (rid, 'Getränke',         'Japanischer Grüntee',       NULL,                                            3.50, NULL, true, 8),
    (rid, 'Getränke',         'Mango Lemonade',            NULL,                                            4.00, NULL, true, 9);

  RAISE NOTICE '[OK] sushi-garden-ulm: % ürün eklendi', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = rid);
END $$;


-- ─────────────────────────────────────────────────────────────
-- 5. DON GIOVANNI  (slug: don-giovanni-ulm)  — 8 ürün
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM restaurants WHERE slug = 'don-giovanni-ulm';
  IF rid IS NULL THEN RAISE NOTICE '[SKIP] don-giovanni-ulm bulunamadı'; RETURN; END IF;

  DELETE FROM menu_items WHERE restaurant_id = rid;

  INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, available, position) VALUES
    (rid, 'Antipasti', 'Bruschetta al Pomodoro',   'Geröstet mit Tomaten, Basilikum, Olivenöl',               6.50, 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400&q=80', true, 1),
    (rid, 'Antipasti', 'Carpaccio di Manzo',        'Hauchdünnes Rinderfilet, Rucola, Parmesan, Kapern',      13.90, NULL, true, 2),
    (rid, 'Pasta',     'Tagliatelle al Tartufo',    'Schwarze Trüffelsauce, Parmesan',                        16.90, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80', true, 3),
    (rid, 'Pasta',     'Rigatoni all''Amatriciana', 'Guanciale, Pecorino, Tomaten, Peperoncino',              13.90, NULL, true, 4),
    (rid, 'Pasta',     'Gnocchi al Gorgonzola',     'Hausgemachte Gnocchi, Gorgonzola-Sahnesauce',            13.50, NULL, true, 5),
    (rid, 'Pasta',     'Spaghetti alle Vongole',    'Venusmuscheln, Weißwein, Knoblauch, Petersilie',         17.90, NULL, true, 6),
    (rid, 'Getränke',  'San Pellegrino 0,5 l',      NULL,                                                      3.50, NULL, true, 7),
    (rid, 'Getränke',  'Prosecco (Glas)',            NULL,                                                      5.90, NULL, true, 8);

  RAISE NOTICE '[OK] don-giovanni-ulm: % ürün eklendi', (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = rid);
END $$;


-- ─────────────────────────────────────────────────────────────
-- Özet: Toplam eklenen ürünler
-- ─────────────────────────────────────────────────────────────
SELECT
  r.slug,
  r.name,
  COUNT(m.id) AS urun_sayisi
FROM restaurants r
LEFT JOIN menu_items m ON m.restaurant_id = r.id
WHERE r.slug IN ('la-mila','pizza-palace-ulm','burger-house-ulm','sushi-garden-ulm','don-giovanni-ulm')
GROUP BY r.slug, r.name
ORDER BY urun_sayisi DESC;
