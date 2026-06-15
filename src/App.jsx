import { useState, useEffect, useRef, useMemo } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const STOPS = [
  { id:1, loc:"Gatwick → Bangkok", dates:["2026-04-05","2026-04-06"], nights:0, country:"Transit",
    tz:7,    lat:13.69,lng:100.75, signal:"good", icon:"✈️",
    insight:"Norse Atlantic flight Z0791 departs London Gatwick South Terminal at 16:00 on a Boeing 787-9 Dreamliner — arriving Bangkok Suvarnabhumi at 09:25 local time on 6 April. Nonstop, roughly 11 hours. Suvarnabhumi means 'Golden Land' in Sanskrit. Expect jetlagged selfies from the airport 7-Eleven before they've even found their bags.",
    parentTip:"Norse Atlantic operates from Gatwick South Terminal. The 787 Dreamliner has higher cabin humidity and lower pressurisation than older aircraft, which helps with jetlag. Bangkok is GMT+7 (6 hours ahead of UK in BST). They land at 09:25 local — by the time they clear immigration and reach the city it'll be lunchtime.",
    leg:{mode:"flight",from:"Gatwick South",to:"Bangkok Suvarnabhumi",detail:"Norse Z0791, 16:00 dep, nonstop 787 Dreamliner. ~11hrs."} },

  { id:2, loc:"Phuket", dates:["2026-04-06","2026-04-09"], nights:3, country:"Thailand",
    tz:7,    lat:7.88,lng:98.39, signal:"good", icon:"🏖️",
    insight:"First taste of tropical Thailand. Phuket is Thailand's largest island — about the size of Singapore. Patong Beach is the party hub, but the Old Town has gorgeous Sino-Portuguese architecture and brilliant street food. They might take a longtail boat to Phi Phi or James Bond Island.",
    parentTip:"Very well set up for tourists. Good hospitals, reliable WiFi, English widely spoken. Water safety: rip currents can be strong — red flags on beaches mean no swimming.",
    leg:{mode:"flight",from:"Bangkok",to:"Phuket",detail:"Likely domestic flight (~1.5hrs). Straightforward start to the island section."} },

  { id:3, loc:"Koh Lanta", dates:["2026-04-09","2026-04-11"], nights:2, country:"Thailand",
    tz:7,    lat:7.65,lng:99.03, signal:"moderate", icon:"🌴",
    insight:"Much mellower than Phuket — long uncrowded beaches, reggae bars, and spectacular sunsets. The Old Town is a fascinating stilted fishing village built by Chinese and Malay traders. Scooter hire is the main way around.",
    parentTip:"Quieter and more relaxed. Ferry from Phuket takes about 3 hours via Phi Phi. Signal can be patchy on the southern beaches. Scooter over-confidence is a bigger risk than the island itself.",
    leg:{mode:"ferry",from:"Phuket",to:"Koh Lanta",detail:"Ferry or speedboat via island-hopping routes; weather can affect timings."} },

  { id:4, loc:"Krabi", dates:["2026-04-11","2026-04-15"], nights:4, country:"Thailand",
    tz:7,    lat:8.09,lng:98.91, signal:"good", icon:"🧗",
    insight:"Home to Railay Beach — one of the most beautiful spots in Thailand, accessible only by longtail boat because sheer limestone cliffs cut it off from the mainland. World-famous for rock climbing. The Emerald Pool (natural hot spring in the jungle) and Tiger Cave Temple (1,237 steps to the top) are classic day trips.",
    parentTip:"Railay is safe but remote — no roads in or out, only boats. Ao Nang is the main tourist hub with ATMs and pharmacies. Four nights suggests they're properly exploring.",
    leg:{mode:"ferry",from:"Koh Lanta",to:"Krabi",detail:"Short boat or van transfer; easy logistics."} },

  { id:5, loc:"Khao Sok National Park", dates:["2026-04-15","2026-04-17"], nights:2, country:"Thailand",
    tz:7,    lat:8.92,lng:98.53, signal:"poor", icon:"🌿",
    insight:"One of the world's oldest rainforests — older than the Amazon. They'll likely sleep in floating raft houses on Cheow Lan Lake, surrounded by towering limestone karsts draped in jungle. Night safaris reveal gibbons, hornbills, and (very rarely) wild elephants. The Rafflesia — the world's largest flower — grows here.",
    parentTip:"⚠️ SIGNAL WARNING: Very limited phone signal and WiFi in the park. If you don't hear from them for 48 hours, this is completely normal. It's one of the most magical stops on the trip.",
    leg:{mode:"bus",from:"Krabi",to:"Khao Sok",detail:"Road transfer inland; feels like a real shift from beaches to jungle."} },

  { id:6, loc:"Bangkok", dates:["2026-04-17","2026-04-21"], nights:4, country:"Thailand",
    tz:7,    lat:13.76,lng:100.50, signal:"good", icon:"🎉",
    insight:"They arrive on 17 April — just after the official Songkran dates (13–15 April) but celebrations extend for days either side and the energy will still be running high. Khao San Road and Silom Road are the main water-fight battlegrounds. Beyond Songkran: the Grand Palace, Wat Pho (reclining Buddha), rooftop bars, and some of the best street food on earth. UNESCO recognised Songkran as Intangible Cultural Heritage.",
    parentTip:"They'll catch tail-end Songkran rather than peak chaos — still very wet and lively but slightly less overwhelming. Remind them to use a waterproof phone pouch. It's also the hottest time of year — 35°C+ daily. Good point for laundry, kit replacement and admin.",
    leg:{mode:"mixed",from:"Khao Sok",to:"Bangkok",detail:"Likely road plus flight or overnight bus/train. Major reset before northern Thailand."} },

  { id:7, loc:"Chiang Mai", dates:["2026-04-21","2026-04-25"], nights:4, country:"Thailand",
    tz:7,    lat:18.79,lng:98.99, signal:"good", icon:"🏛️",
    insight:"The cultural heart of northern Thailand — over 300 Buddhist temples within the old city walls. Famous for cooking classes, the incredible Sunday Walking Street night market, and ethical elephant sanctuaries. The Old City is a perfect square surrounded by a moat.",
    parentTip:"Much cooler and calmer than Bangkok. Excellent medical facilities. Elephant Nature Park is the most reputable sanctuary. This is where most backpackers fall in love with Thailand.",
    leg:{mode:"flight",from:"Bangkok",to:"Chiang Mai",detail:"Short domestic flight (~1.5hrs); one of the easiest hops."} },

  { id:8, loc:"Pai", dates:["2026-04-25","2026-04-27"], nights:2, country:"Thailand",
    tz:7,    lat:19.36,lng:98.44, signal:"moderate", icon:"🌄",
    insight:"A tiny bohemian town in a mountain valley — tie-dye, live music, hot springs. The drive from Chiang Mai is 762 curves through the mountains (yes, they count them). Pai Canyon at sunset is the classic photo. The vibe is extremely laid-back — yoga, organic cafes, riverside bamboo huts.",
    parentTip:"The 762-curve mountain road from Chiang Mai can cause travel sickness — about 3 hours by minibus. Pai is small and very safe, but the road in/out is the main risk factor.",
    leg:{mode:"bus",from:"Chiang Mai",to:"Pai",detail:"Mountain minibus; many bends, not dangerous but tiring. ~3 hours."} },

  { id:9, loc:"Chiang Rai", dates:["2026-04-27","2026-04-28"], nights:1, country:"Thailand",
    tz:7,    lat:19.91,lng:99.84, signal:"good", icon:"⛩️",
    insight:"Home to the White Temple (Wat Rong Khun) — a surreal, glittering Buddhist temple that looks like it's made of ice. Also the Blue Temple and the bizarre Black House art museum. Gateway to the Golden Triangle where Thailand, Laos and Myanmar meet.",
    parentTip:"One-night stay = transit stop before crossing into Laos. The border crossing at Chiang Khong/Huay Xai is straightforward.",
    leg:{mode:"bus",from:"Pai",to:"Chiang Rai",detail:"Road transfer across northern Thailand before the Mekong section."} },

  { id:10, loc:"Pak Beng, Laos", dates:["2026-04-28","2026-04-29"], nights:1, country:"Laos",
    tz:7,    lat:19.89,lng:101.14, signal:"poor", icon:"🚢",
    insight:"The midway stop on the legendary two-day slow boat down the Mekong from the Thai border to Luang Prabang. Pak Beng is a tiny riverside village — essentially one steep street of guesthouses that exists to serve slow boat passengers. The Happy Bar is where all travellers congregate for pool and Beer Lao.",
    parentTip:"⚠️ SIGNAL WARNING: Very limited connectivity. The slow boat has no WiFi and phone signal is intermittent along the Mekong. Each day is 6-7 hours on wooden benches — uncomfortable but unforgettable. Classic backpacker rite of passage.",
    leg:{mode:"ferry",from:"Thai border / Huay Xai",to:"Pak Beng",detail:"Cross-border into Laos then the famous slow boat down the Mekong. Day 1 of 2."} },

  { id:11, loc:"Luang Prabang", dates:["2026-04-29","2026-05-02"], nights:3, country:"Laos",
    tz:7,    lat:19.89,lng:102.13, signal:"moderate", icon:"🙏",
    insight:"A UNESCO World Heritage city at the confluence of the Mekong and Nam Khan rivers. French colonial architecture, saffron-robed monks collecting morning alms (Tak Bat) at dawn, the stunning Kuang Si waterfalls with turquoise pools, and the night market on the main street. Often described as the most beautiful small city in Southeast Asia.",
    parentTip:"Extremely safe and walkable. The morning alms ceremony starts at 5:30am — they should watch respectfully without flash photography. Laos is significantly cheaper than Thailand.",
    leg:{mode:"ferry",from:"Pak Beng",to:"Luang Prabang",detail:"Day 2 of the slow boat; ends in one of the loveliest towns in the region."} },

  { id:12, loc:"Nong Khiaw", dates:["2026-05-02","2026-05-04"], nights:2, country:"Laos",
    tz:7,    lat:20.57,lng:102.61, signal:"poor", icon:"🏔️",
    insight:"A tiny riverside town wedged between dramatic limestone cliffs on the Nam Ou river. The Laos most tourists never see — kayaking, trekking to remote Hmong villages, swimming in hidden caves. The viewpoint hike (Pha Daeng) is a steep scramble rewarded with jaw-dropping panoramas.",
    parentTip:"⚠️ SIGNAL WARNING: Very remote with limited connectivity. This is genuinely off the beaten track. If messages are sparse, that's the terrain, not a problem.",
    leg:{mode:"bus",from:"Luang Prabang",to:"Nong Khiaw",detail:"Road transfer north into much quieter Laos."} },

  { id:13, loc:"Vang Vieng", dates:["2026-05-04","2026-05-07"], nights:3, country:"Laos",
    tz:7,    lat:18.92,lng:102.45, signal:"moderate", icon:"🛶",
    insight:"Once infamous as a party town, Vang Vieng has matured into an adventure hub surrounded by extraordinary karst scenery. Tubing down the Nam Song river is still the signature activity, but now there's also kayaking, rock climbing, zip-lining, and the Blue Lagoons. The landscape is genuinely otherworldly.",
    parentTip:"Cleaned up significantly after safety crackdowns. Tubing is much safer than a decade ago but still involves alcohol — the main risk. Three nights = full adventure menu.",
    leg:{mode:"mixed",from:"Nong Khiaw",to:"Vang Vieng",detail:"Likely return via Luang Prabang then Laos-China railway or bus south."} },

  { id:14, loc:"Vientiane", dates:["2026-05-07","2026-05-08"], nights:1, country:"Laos",
    tz:7,    lat:17.98,lng:102.63, signal:"good", icon:"🏛️",
    insight:"The world's most laid-back capital city — feels more like a provincial French town. Baguette stalls, riverside cafes, the golden Pha That Luang stupa. COPE Visitor Centre tells the devastating story of Laos being the most heavily bombed country in history.",
    parentTip:"One-night transit before flying to Hanoi. Good connectivity, international airport. Currency is Lao Kip. Useful for cash, flights and regrouping before Vietnam.",
    leg:{mode:"mixed",from:"Vang Vieng",to:"Vientiane",detail:"Fast train or bus south; much easier now than the old road-only route."} },

  { id:15, loc:"Hanoi", dates:["2026-05-08","2026-05-11"], nights:3, country:"Vietnam",
    tz:7,    lat:21.03,lng:105.85, signal:"good", icon:"🏍️",
    insight:"Vietnam's capital is absolute sensory overload — thousands of motorbikes, pho from every corner, the atmospheric Old Quarter with 36 ancient trading streets, Hoan Kiem Lake, and the best coffee culture in SE Asia (egg coffee is a must). Crossing the road is an art form — walk slowly and traffic flows around you.",
    parentTip:"Loud, chaotic and utterly wonderful. Bag-snatching from motorbikes is the main risk — carry bags on the building side. Vietnamese coffee is incredibly strong. Bia Hoi junction serves 25p beer.",
    leg:{mode:"flight",from:"Vientiane",to:"Hanoi",detail:"Short regional flight; major cultural shift into Vietnam."} },

  { id:16, loc:"Ha Giang", dates:["2026-05-11","2026-05-14"], nights:3, country:"Vietnam",
    tz:7,    lat:22.82,lng:104.98, signal:"poor", icon:"🏍️",
    insight:"THE highlight of Vietnam for most backpackers. The Ha Giang Loop is a 350km motorbike circuit through some of the most dramatic mountain scenery on earth — terraced rice paddies, deep canyons, the Ma Pi Leng pass ('King of Passes'), and remote ethnic minority villages. Roads carved into sheer cliff faces above the Nho Que river.",
    parentTip:"⚠️ THIS IS THE SECTION THAT WILL WORRY YOU MOST. Most backpackers hire an experienced local Easy Rider driver rather than riding themselves. Travel insurance covering motorbike pillion is essential. Signal is very patchy. Three days of limited contact is normal.",
    leg:{mode:"bus",from:"Hanoi",to:"Ha Giang",detail:"Usually overnight or early bus (~6hrs), then a 3-4 day loop by bike or with Easy Rider driver."} },

  { id:17, loc:"Sa Pa", dates:["2026-05-14","2026-05-16"], nights:2, country:"Vietnam",
    tz:7,    lat:22.34,lng:103.84, signal:"moderate", icon:"🌾",
    insight:"A mountain town famous for spectacular rice terraces carved into the Hoang Lien Son mountains. Home to Hmong, Dao and Tay ethnic minorities selling gorgeous handwoven textiles. Trekking through terraces to Cat Cat Village is the classic experience. Fansipan — Indochina's highest peak — is accessible by cable car.",
    parentTip:"Can be cold and misty at altitude (1,500m) — they'll need a jacket. Town has modernised rapidly with good WiFi. Local ethnic minority guides are the best way to trek responsibly.",
    leg:{mode:"bus",from:"Ha Giang",to:"Sa Pa",detail:"Long overland transfer between northern mountain regions. Tiring."} },

  { id:18, loc:"Ha Long Bay", dates:["2026-05-16","2026-05-18"], nights:2, country:"Vietnam",
    tz:7,    lat:20.91,lng:107.18, signal:"poor", icon:"⛵",
    insight:"One of the New Seven Natural Wonders — nearly 2,000 limestone karsts and islands rising from emerald waters. They'll almost certainly do an overnight cruise on a traditional junk boat, including kayaking through grottoes, swimming, and sleeping on deck under the stars.",
    parentTip:"⚠️ SIGNAL WARNING: Limited signal on the bay. Two nights suggests a proper cruise rather than a day trip — much better experience. Book through a reputable operator (not the cheapest).",
    leg:{mode:"cruise",from:"Sa Pa / via Hanoi",to:"Ha Long Bay",detail:"Likely back via Hanoi then transfer to the bay for overnight cruise."} },

  { id:19, loc:"Ninh Binh", dates:["2026-05-18","2026-05-21"], nights:3, country:"Vietnam",
    tz:7,    lat:20.25,lng:105.97, signal:"moderate", icon:"🚣",
    insight:"Known as 'Ha Long Bay on land' — karst mountains rising from flooded rice paddies. Tam Coc boat trip through three river caves is magical. Trang An is a UNESCO World Heritage site. Mua Cave has 500 steps to a viewpoint that's become one of Vietnam's most Instagrammed spots.",
    parentTip:"Three nights is generous — they're clearly taking their time through northern Vietnam. Very safe and easy to explore by bicycle.",
    leg:{mode:"bus",from:"Ha Long Bay",to:"Ninh Binh",detail:"Overland connection back toward the Red River Delta."} },

  { id:20, loc:"Phong Nha", dates:["2026-05-21","2026-05-23"], nights:2, country:"Vietnam",
    tz:7,    lat:17.59,lng:106.28, signal:"moderate", icon:"🦇",
    insight:"Home to the world's largest cave — Son Doong — which has its own weather system, jungle and river inside. They likely won't visit Son Doong (£2,500, books months ahead) but Phong Nha Cave and Paradise Cave are breathtaking. The Dark Cave involves zip-lining, kayaking and mud-bathing inside a cavern.",
    parentTip:"The caves are genuinely awe-inspiring — UNESCO World Heritage site. The Dark Cave activity is a highlight but involves swimming in cave darkness. Good fun, slightly unnerving to picture.",
    leg:{mode:"mixed",from:"Ninh Binh",to:"Phong Nha",detail:"Usually rail or overnight transport south, then local transfer. Long travel day."} },

  { id:21, loc:"Hue", dates:["2026-05-23","2026-05-23"], nights:0, country:"Vietnam",
    tz:7,    lat:16.46,lng:107.59, signal:"good", icon:"🏯",
    insight:"Vietnam's former imperial capital — a walled citadel modelled on Beijing's Forbidden City. The Perfume River, ornate royal tombs, and the poignant legacy of the Battle of Hue (1968). Bun Bo Hue (spicy beef noodle soup) is one of Vietnam's greatest dishes.",
    parentTip:"Zero nights = transit stop en route to Da Nang. The Hai Van Pass between Hue and Da Nang is one of the most scenic coastal roads in the world — Jeremy Clarkson called it the best.",
    leg:{mode:"mixed",from:"Phong Nha",to:"Hue",detail:"Rail or bus south; connector rather than a stay."},
    confirm:"Zero-night stopover — they may extend this if the pace feels too fast through central Vietnam." },

  { id:22, loc:"Da Nang", dates:["2026-05-23","2026-05-25"], nights:2, country:"Vietnam",
    tz:7,    lat:16.05,lng:108.20, signal:"good", icon:"🌉",
    insight:"Vietnam's third-largest city, famous for the Dragon Bridge (breathes actual fire on weekend nights), the Marble Mountains (caves and pagodas inside limestone peaks), and My Khe Beach. Ba Na Hills has the iconic Golden Bridge held up by giant stone hands.",
    parentTip:"Modern, clean, well-organised city. Very safe. Great WiFi. If they ride the Hai Van Pass from Hue, this is one of the trip's most spectacular road stretches.",
    leg:{mode:"mixed",from:"Hue",to:"Da Nang",detail:"Short scenic move, potentially over the Hai Van Pass by motorbike or bus."} },

  { id:23, loc:"Hoi An", dates:["2026-05-25","2026-05-28"], nights:3, country:"Vietnam",
    tz:7,    lat:15.88,lng:108.34, signal:"good", icon:"🏮",
    insight:"An enchanting ancient trading port where every full moon the old town turns off its electric lights and illuminates with lanterns and candles. The Japanese Covered Bridge dates from the 16th century. Famous for tailors — custom suits, dresses and shoes in 24 hours. Banh Mi Phuong serves what Anthony Bourdain called the best sandwich in the world.",
    parentTip:"Widely considered the safest, most charming town in Vietnam. Three nights = time for tailoring, cooking classes and cycling through rice paddies. Low concern stop. Expect the nicest pictures and happiest messages.",
    leg:{mode:"taxi",from:"Da Nang",to:"Hoi An",detail:"Very short transfer (~30 mins); these two places work as one travel cluster."} },

  { id:24, loc:"Quy Nhon", dates:["2026-05-28","2026-05-30"], nights:2, country:"Vietnam",
    tz:7,    lat:13.78,lng:109.22, signal:"moderate", icon:"🏖️",
    insight:"A genuine off-the-beaten-track coastal stop most tourists skip. Beautiful quiet beaches, excellent seafood, and the haunting Cham towers of Banh It — remnants of the ancient Champa civilisation. The kind of place where you're the only tourists on the beach.",
    parentTip:"The fact this is on the itinerary shows good research — it's a local favourite, not a backpacker cliché. Low-key and safe.",
    leg:{mode:"mixed",from:"Hoi An / Da Nang",to:"Quy Nhon",detail:"Likely train or long bus down the coast."},
    confirm:"This stop was marked 'Unlabeled' in the source itinerary — treat as probable rather than final." },

  { id:25, loc:"Da Lat", dates:["2026-05-30","2026-06-01"], nights:2, country:"Vietnam",
    tz:7,    lat:11.95,lng:108.44, signal:"good", icon:"🌸",
    insight:"Vietnam's 'City of Eternal Spring' — a former French hill station at 1,500m altitude with refreshingly cool climate. The Crazy House is a surreal Gaudi-like building. Famous for strawberries, artichoke tea, coffee farms, and canyoning (abseiling down waterfalls).",
    parentTip:"Welcome cool break from coastal heat. Canyoning is the main adventure activity — rappelling down waterfalls into pools. Exhilarating but carries some risk.",
    leg:{mode:"bus",from:"Quy Nhon",to:"Da Lat",detail:"Long inland road move from coast to highlands."} },

  { id:26, loc:"Mui Ne", dates:["2026-06-01","2026-06-02"], nights:1, country:"Vietnam",
    tz:7,    lat:10.93,lng:108.28, signal:"moderate", icon:"🏜️",
    insight:"Bizarre landscape of massive red and white sand dunes right next to the sea — like the Sahara met the South China Sea. The Fairy Stream is a shallow red-water canyon you wade through barefoot. Vietnam's kitesurfing capital. Sunrise on the white dunes is the classic photo.",
    parentTip:"One-night stopover = quick dunes visit before HCMC. Fast-moving section — watch for travel fatigue.",
    leg:{mode:"bus",from:"Da Lat",to:"Mui Ne",detail:"Shorter road drop from highlands to coast."} },

  { id:27, loc:"Ho Chi Minh City", dates:["2026-06-02","2026-06-05"], nights:3, country:"Vietnam",
    tz:7,    lat:10.82,lng:106.63, signal:"good", icon:"🏙️",
    insight:"Still called Saigon by locals — Vietnam's largest, loudest, most energetic city. The War Remnants Museum is profoundly moving. Cu Chi Tunnels (vast Viet Cong tunnel network) are a sobering day trip. Ben Thanh Market, rooftop bars, and chaotic street food. District 1 is the backpacker hub.",
    parentTip:"Safe but intense — 9 million motorbikes. Bui Vien backpacker street can get rowdy at night. Last major Vietnam stop before Cambodia.",
    leg:{mode:"bus",from:"Mui Ne",to:"Ho Chi Minh City",detail:"Simple final overland hop in Vietnam (~4-5hrs)."} },

  { id:28, loc:"Phnom Penh", dates:["2026-06-05","2026-06-08"], nights:3, country:"Cambodia",
    tz:7,    lat:11.56,lng:104.93, signal:"good", icon:"🏛️",
    insight:"Cambodia's capital is raw, confronting and important. The Killing Fields (Choeung Ek) and Tuol Sleng Genocide Museum document the Khmer Rouge horrors — deeply upsetting but essential. The Royal Palace, Silver Pagoda, riverside promenade at sunset, and the emerging rooftop bar scene show a city rebuilding with extraordinary resilience.",
    parentTip:"The Killing Fields visit will be emotionally heavy — completely normal. Cambodia uses USD as well as Riel. Tuk-tuks are main transport. Bus from HCMC takes ~6 hours including border.",
    leg:{mode:"bus",from:"Ho Chi Minh City",to:"Phnom Penh",detail:"Common overland cross-border route; manageable but admin-heavy at the border."} },

  { id:29, loc:"Siem Reap", dates:["2026-06-08","2026-06-11"], nights:3, country:"Cambodia",
    tz:7,    lat:13.36,lng:103.86, signal:"good", icon:"🛕",
    insight:"Gateway to Angkor Wat — the largest religious monument ever built. Sunrise at Angkor Wat is one of the most iconic moments in world travel. The Bayon temple has 216 enormous serene stone faces. Ta Prohm (the 'Tomb Raider temple') is being consumed by giant strangler fig trees. Pub Street is the lively backpacker strip.",
    parentTip:"Three nights is ideal for Angkor. It will be extremely hot (35°C+). Insist they drink constantly and wear sunscreen. Temples require covered shoulders and knees. Heat and early starts are the challenge, not safety.",
    leg:{mode:"bus",from:"Phnom Penh",to:"Siem Reap",detail:"Standard Cambodia overland transfer north (~6hrs)."} },

  { id:30, loc:"Bangkok (Transit)", dates:["2026-06-11","2026-06-14"], nights:3, country:"Thailand",
    tz:7,    lat:13.76,lng:100.50, signal:"good", icon:"✈️",
    insight:"Back to Bangkok as a transit hub — they'll know the city by now. Three nights to restock, laundry, and enjoy creature comforts before the updated final leg begins in Laos. Chatuchak Weekend Market (15,000+ stalls!) is worth a visit if timing works.",
    parentTip:"Bangkok will feel like coming home. Good chance to regroup, restock first aid supplies, and sort the jump back toward Laos before the final section of the trip.",
    leg:{mode:"flight",from:"Siem Reap",to:"Bangkok",detail:"Quick regional flight or organised overland return into Thailand."} },

  { id:31, loc:"Vang Vieng", dates:["2026-06-14","2026-06-16"], nights:2, country:"Laos",
    tz:7,    lat:18.92,lng:102.45, signal:"moderate", icon:"🛶",
    insight:"Once infamous as a party town, Vang Vieng has matured into an adventure hub surrounded by extraordinary karst scenery. Tubing down the Nam Song river is still the signature activity, but now there's also kayaking, rock climbing, zip-lining, and the Blue Lagoons. The landscape is genuinely otherworldly.",
    parentTip:"Two nights is enough for the classic lagoons and river scenery without lingering too long. Tubing is much safer than it was years ago, but alcohol and water remain the sensible-parent watch-outs.",
    leg:{mode:"mixed",from:"Bangkok",to:"Vang Vieng",detail:"Final leg starts here on 14 June; likely flight/rail/road via Vientiane or another Laos connection."} },

  { id:32, loc:"Luang Prabang", dates:["2026-06-16","2026-06-18"], nights:2, country:"Laos",
    tz:7,    lat:19.89,lng:102.13, signal:"moderate", icon:"🙏",
    insight:"A UNESCO World Heritage city at the confluence of the Mekong and Nam Khan rivers. French colonial architecture, saffron-robed monks collecting morning alms at dawn, Kuang Si waterfalls with turquoise pools, and the night market on the main street make it one of Southeast Asia's loveliest small cities.",
    parentTip:"Extremely safe and walkable. The morning alms ceremony starts early and should be watched respectfully without flash photography. Two nights keeps this as a beautiful, compact stop.",
    leg:{mode:"train",from:"Vang Vieng",to:"Luang Prabang",detail:"Laos-China railway or road transfer north through the mountains."} },

  { id:33, loc:"Bangkok", dates:["2026-06-18","2026-06-20"], nights:2, country:"Thailand",
    tz:7,    lat:13.76,lng:100.50, signal:"good", icon:"🎉",
    insight:"A quick Bangkok reset before the Gulf islands: street food, malls, rooftop views, temples, laundry, and logistics. By now they'll know how to move around the city and it will feel far less overwhelming than the first visit.",
    parentTip:"Two nights is practical rather than indulgent. This is the admin stop before the overnight train south, so it is a good moment for charging cables, pharmacy bits, cash, laundry and ferry tickets.",
    leg:{mode:"flight",from:"Luang Prabang",to:"Bangkok",detail:"Regional hop back into Thailand before heading south to the islands."} },

  { id:34, loc:"Overnight train to Koh Samui", dates:["2026-06-20","2026-06-21"], nights:1, country:"Transit",
    tz:7,    lat:11.45,lng:99.50, signal:"moderate", icon:"🚂",
    insight:"The planner shows one travel night after Bangkok. This is the classic southbound sleeper-train style move toward Surat Thani, followed by transfer and ferry over to Koh Samui.",
    parentTip:"A planned overnight travel night can look quiet from home: phones charging badly, intermittent signal, odd arrival times. Tiring, but a normal backpacker route.",
    leg:{mode:"train",from:"Bangkok",to:"Koh Samui",detail:"Overnight train or equivalent southbound transfer, then onward ferry to the island."} },

  { id:35, loc:"Koh Samui", dates:["2026-06-21","2026-06-24"], nights:3, country:"Thailand",
    tz:7,    lat:9.51,lng:100.01, signal:"good", icon:"🌺",
    insight:"Most developed of the Gulf islands — proper resorts, international restaurants, even a Tesco Lotus. Chaweng Beach is the main strip. Ang Thong Marine Park (42 islands) is a spectacular day trip by speedboat.",
    parentTip:"Koh Samui has an international airport with direct flights. If anything goes wrong, this is one of the easiest places to access medical care or arrange emergency flights.",
    leg:{mode:"mixed",from:"Overnight train",to:"Koh Samui",detail:"Arrive from the southbound train/road leg, then ferry across to Samui."} },

  { id:36, loc:"Koh Phangan", dates:["2026-06-24","2026-06-26"], nights:2, country:"Thailand",
    tz:7,    lat:9.73,lng:100.01, signal:"moderate", icon:"🎶",
    insight:"Famous worldwide for the Full Moon Party on Haad Rin beach, but the rest of the island is surprisingly peaceful: Bottle Beach, Thong Nai Pan, waterfalls, viewpoints and yoga retreats tucked away from the party strip.",
    parentTip:"Two nights suggests a focused island stop rather than a long party base. Main risks are the usual party-island basics: shoes on the beach, watch drinks, and do not get casual with scooters.",
    leg:{mode:"ferry",from:"Koh Samui",to:"Koh Phangan",detail:"Very easy inter-island ferry, usually around 30-60 minutes."} },

  { id:37, loc:"Koh Tao", dates:["2026-06-26","2026-06-30"], nights:4, country:"Thailand",
    tz:7,    lat:10.10,lng:99.84, signal:"moderate", icon:"🤿",
    insight:"The world's most popular and affordable place to get PADI Open Water scuba certified. Tiny island, clear water, coral reefs, whale sharks if they're lucky, and Sairee Beach as the main social strip.",
    parentTip:"Four nights is enough for a dive course or a few relaxed snorkel/dive days. Diving is well regulated, but ferry days and scooter temptation are the things to keep in mind.",
    leg:{mode:"ferry",from:"Koh Phangan",to:"Koh Tao",detail:"Short ferry north through the Gulf islands."} },

  { id:38, loc:"Thailand → Penang transit", dates:["2026-06-30","2026-07-01"], nights:1, country:"Transit",
    tz:8,    lat:6.25,lng:100.60, signal:"moderate", icon:"🔀",
    insight:"The dates imply one travel night between Koh Tao ending on 30 June and George Town beginning on 1 July. This is the long move from the Thai islands toward Penang.",
    parentTip:"This is the fiddly travel night in the updated route. Expect ferry timing, airport or bus connections, and slower replies while they cross from Thailand into Malaysia.",
    leg:{mode:"mixed",from:"Koh Tao",to:"George Town",detail:"Ferry plus onward flight, bus or train connection toward Penang."} },

  { id:39, loc:"George Town", dates:["2026-07-01","2026-07-03"], nights:2, country:"Malaysia",
    tz:8,    lat:5.41,lng:100.33, signal:"good", icon:"🏮",
    insight:"Penang's George Town is a UNESCO World Heritage city famous for street art, Chinese shophouses, clan jetties and some of the best food in Asia. Char kway teow, laksa and roti canai are the real itinerary here.",
    parentTip:"Very walkable, food-focused and safe. Two nights is a neat city break after the Thai islands and before the more modern Malaysia/Singapore stretch.",
    leg:{mode:"mixed",from:"Koh Tao",to:"George Town",detail:"Long transfer from the islands into Penang; the planner shows George Town starting 1 July."} },

  { id:40, loc:"Kuala Lumpur", dates:["2026-07-03","2026-07-05"], nights:2, country:"Malaysia",
    tz:8,    lat:3.14,lng:101.69, signal:"good", icon:"🏙️",
    insight:"Malaysia's gleaming capital — Petronas Twin Towers (once world's tallest), incredible food courts mixing Malay, Chinese, Indian and Nyonya cuisines, Batu Caves (272 steps to a Hindu temple inside limestone), and the wonderful Jalan Alor food street. Dramatically more modern and organised than Thailand.",
    parentTip:"Will feel like arriving in a different world — air-conditioned malls, spotless metro, very efficient. English widely spoken. Malaysia is majority Muslim — more conservative dress in some areas.",
    leg:{mode:"train",from:"George Town",to:"Kuala Lumpur",detail:"Penang to Kuala Lumpur is a common road, rail or flight move; the planner shows 334 km."},
    confirm:"The source planner label is truncated as 'Kuala Lumpur Interna...'; this app treats it as the Kuala Lumpur stop unless the airport stay needs to be shown literally." },

  { id:41, loc:"Singapore", dates:["2026-07-05","2026-07-06"], nights:1, country:"Singapore",
    tz:8,    lat:1.35,lng:103.82, signal:"good", icon:"🌃",
    insight:"Ultimate contrast — hyper-modern, immaculate, extraordinarily expensive by SE Asian standards. Gardens by the Bay, Marina Bay Sands, hawker centres, Little India, Chinatown, and Changi Airport's famous indoor waterfall if they pass through the terminals.",
    parentTip:"Safest country on the itinerary, but expensive. With only one night, this is likely a sharp transit city stop before Bali rather than a long Singapore stay.",
    leg:{mode:"bus",from:"Kuala Lumpur",to:"Singapore",detail:"Fast common overland route between two very connected cities; the planner shows 297 km."},
    confirm:"The source planner label is truncated as 'Singapore Changi Air...'; this app treats it as the Singapore stop unless it should be pinned specifically to Changi Airport." },

  { id:42, loc:"Seminyak", dates:["2026-07-06","2026-07-09"], nights:3, country:"Indonesia",
    tz:8,    lat:-8.69,lng:115.17, signal:"good", icon:"🏖️",
    insight:"Seminyak is Bali's more polished beach base: boutiques, restaurants, sunset bars and long surf beaches. It is a soft landing into Indonesia after the Malaysia/Singapore city section.",
    parentTip:"Very tourist-friendly with good WiFi, pharmacies and easy transport. Traffic is the nuisance, not remoteness. Three nights is enough to decompress before the Gili boat.",
    leg:{mode:"flight",from:"Singapore",to:"Bali / Seminyak",detail:"International hop to Bali, then road transfer to the Seminyak coast."} },

  { id:43, loc:"Gili Trawangan", dates:["2026-07-09","2026-07-13"], nights:4, country:"Indonesia",
    tz:8,    lat:-8.35,lng:116.03, signal:"moderate", icon:"🐢",
    insight:"Largest of three tiny Gili Islands off Lombok — no cars, no motorbikes, just horse carts and bicycles on a coral-fringed island walkable in two hours. Famous for underwater sculptures, sea turtles on every snorkel, and legendary sunsets with Bali's Mount Agung on the horizon.",
    parentTip:"Very charming but limited emergency infrastructure — the 'hospital' is a small clinic. Fast boats from Bali take ~2 hours and can be rough in bad weather.",
    leg:{mode:"ferry",from:"Seminyak / Bali",to:"Gili Trawangan",detail:"Road transfer to the harbour, then fast boat across to the Gilis."} },

  { id:44, loc:"Ubud", dates:["2026-07-13","2026-07-16"], nights:3, country:"Indonesia",
    tz:8,    lat:-8.51,lng:115.26, signal:"good", icon:"🎨",
    insight:"Bali's spiritual and artistic heart — Tegallalang rice terraces, the Sacred Monkey Forest, traditional dance performances, yoga retreats, and incredible organic restaurants. Campuhan Ridge Walk at sunrise is a gentle path through rolling grasslands. Thriving art scene with galleries and batik workshops.",
    parentTip:"Inland and cooler than the coast. Very safe, very well set up. The Monkey Forest monkeys will steal sunglasses and phones if given a chance. Three nights gives a proper culture-and-food pause.",
    leg:{mode:"ferry",from:"Gili Trawangan",to:"Ubud",detail:"Fast boat back to Bali, then inland transfer to Ubud."} },

  { id:45, loc:"Uluwatu Beach", dates:["2026-07-16","2026-07-18"], nights:2, country:"Indonesia",
    tz:8,    lat:-8.83,lng:115.08, signal:"good", icon:"🌅",
    insight:"Dramatic clifftop temple perched 70m above the Indian Ocean with Kecak fire dance at sunset — one of Bali's most magical experiences. Beaches below (Padang Padang, Dreamland, Bingin) reached by steep cliff staircases. Single Fin beach club Sunday sessions are legendary.",
    parentTip:"Beautiful but cliff paths are steep and the temple monkeys are talented thieves. Two nights keeps it as a scenic south-Bali stop before the final Canggu base.",
    leg:{mode:"taxi",from:"Ubud",to:"Uluwatu Beach",detail:"Short road transfer from inland Bali to the southern cliffs."} },

  { id:46, loc:"Canggu", dates:["2026-07-18","2026-07-23"], nights:5, country:"Indonesia",
    tz:8,    lat:-8.65,lng:115.14, signal:"good", icon:"🏄",
    insight:"Canggu is Bali's social surf-and-cafe base: beach clubs, rice-field lanes, açai bowls, co-working spaces, Tanah Lot sunsets nearby, and enough familiarity to unpack properly at the end of the route.",
    parentTip:"Five nights in one place at the end is reassuring. Good WiFi, pharmacies, Western food if they need a reset, and plenty of easy beach time before the trip wraps on 23 July.",
    leg:{mode:"taxi",from:"Uluwatu Beach",to:"Canggu",detail:"Short Bali transfer into the final beach base."} },
];

const COUNTRIES = [
  {name:"Thailand",flag:"🇹🇭",c:"#E85D3A"}, {name:"Laos",flag:"🇱🇦",c:"#2D9B83"},
  {name:"Vietnam",flag:"🇻🇳",c:"#D4A843"}, {name:"Cambodia",flag:"🇰🇭",c:"#8B5CF6"},
  {name:"Malaysia",flag:"🇲🇾",c:"#3B82F6"}, {name:"Singapore",flag:"🇸🇬",c:"#EC4899"},
  {name:"Indonesia",flag:"🇮🇩",c:"#F97316"},
];

const TRIP_START = STOPS[0].dates[0];
const TRIP_END = STOPS[STOPS.length - 1].dates[1];
const FINAL_DESTINATION = STOPS[STOPS.length - 1].loc;

const TRAVEL_PHOTOS = [
  { id:"departure-gatwick", stopId:1, src:"/travel-photos/departure-gatwick.jpg", date:"2026-04-05", country:"Transit", place:"Gatwick", title:"Ready for the off", caption:"The first suitcase-photo moment before the long road east.", focus:"center" },
  { id:"phuket-longtail", stopId:2, src:"/travel-photos/phuket-longtail.jpg", date:"2026-04-08", country:"Thailand", place:"Phuket waters", title:"Longtail boat day", caption:"Turquoise water, limestone cliffs, and the first proper island postcard.", focus:"center" },
  { id:"krabi-temple-night", stopId:4, src:"/travel-photos/krabi-temple-night.jpg", date:"2026-04-15", country:"Thailand", place:"Krabi", title:"Temple lights", caption:"A golden evening from the Thailand chapter.", focus:"center" },
  { id:"bangkok-neon", stopId:6, src:"/travel-photos/bangkok-neon.jpg", date:"2026-04-21", country:"Thailand", place:"Bangkok", title:"Bangkok after dark", caption:"Neon signs, traffic, heat, and that big-city travel buzz.", focus:"center" },
  { id:"northern-thailand-elephant", stopId:8, src:"/travel-photos/northern-thailand-elephant.jpg", date:"2026-04-26", country:"Thailand", place:"Northern Thailand", title:"Elephant sanctuary", caption:"One of those days that will probably still be talked about years later.", focus:"center" },
  { id:"elephant-sanctuary-selfie", stopId:8, src:"/travel-photos/elephant-sanctuary-selfie.jpg", date:"2026-04-26", country:"Thailand", place:"Northern Thailand", title:"Sanctuary smiles", caption:"Friends, dust, sunshine and a very memorable backdrop.", focus:"center" },
  { id:"northern-thailand-canyon", stopId:9, src:"/travel-photos/northern-thailand-canyon.jpg", date:"2026-04-27", country:"Thailand", place:"Northern Thailand", title:"Canyon evening", caption:"A sent-photo timestamp places this near the northern Thailand stretch.", focus:"center" },
  { id:"vang-vieng-viewpoint-selfie", stopId:13, src:"/travel-photos/vang-vieng-viewpoint-selfie.jpg", date:"2026-05-04", country:"Laos", place:"Vang Vieng", title:"Karst country", caption:"The Laos chapter opening up into limestone hills and big skies.", focus:"center" },
  { id:"vang-vieng-viewpoint", stopId:13, src:"/travel-photos/vang-vieng-viewpoint.jpg", date:"2026-05-04", country:"Laos", place:"Vang Vieng", title:"Viewpoint pause", caption:"A high, hazy view from the first Vang Vieng pass through Laos.", focus:"center" },
  { id:"white-temple-portrait", stopId:9, src:"/travel-photos/white-temple-portrait.jpg", date:"2026-05-08", country:"Thailand", place:"Likely Chiang Rai", title:"White temple", caption:"The visual clue is stronger than the sent date here, so this is kept as a likely place match.", focus:"center" },
  { id:"ha-giang-pass-wide", stopId:16, src:"/travel-photos/ha-giang-pass-wide.jpg", date:"2026-05-13", country:"Vietnam", place:"Ha Giang", title:"Mountain roads", caption:"The dramatic northern Vietnam views everyone worries about and everyone remembers.", focus:"center" },
  { id:"ha-giang-flag-road", stopId:16, src:"/travel-photos/ha-giang-flag-road.jpg", date:"2026-05-14", country:"Vietnam", place:"Ha Giang", title:"The pass", caption:"Hairpin roads, steep green valleys, and proper adventure energy.", focus:"center" },
  { id:"ha-giang-friends", stopId:16, src:"/travel-photos/ha-giang-friends.jpg", date:"2026-05-14", country:"Vietnam", place:"Ha Giang", title:"Road-trip proof", caption:"The reassuring version of the motorbike chapter: helmets off, smiles on.", focus:"center" },
  { id:"ha-giang-valley", stopId:16, src:"/travel-photos/ha-giang-valley.jpg", date:"2026-05-15", country:"Vietnam", place:"Ha Giang", title:"Valley sweep", caption:"A wide-open northern Vietnam view from the mountain section.", focus:"center" },
  { id:"hoi-an-lantern-friends", stopId:23, src:"/travel-photos/hoi-an-lantern-friends.jpg", date:"2026-06-01", country:"Vietnam", place:"Likely Hoi An", title:"Lantern night", caption:"Shared later, but visually this belongs with the Hoi An lantern chapter.", focus:"center" },
  { id:"hoi-an-lantern-street", stopId:23, src:"/travel-photos/hoi-an-lantern-street.jpg", date:"2026-06-01", country:"Vietnam", place:"Likely Hoi An", title:"Lantern market", caption:"Colour, bustle and the glow people imagine when they picture Hoi An.", focus:"center" },
  { id:"hoi-an-lantern-tree", stopId:23, src:"/travel-photos/hoi-an-lantern-tree.jpg", date:"2026-06-01", country:"Vietnam", place:"Likely Hoi An", title:"Lantern canopy", caption:"A softer lantern shot for the middle of the Vietnam story.", focus:"center" },
  { id:"vang-vieng-paramotor", stopId:31, src:"/travel-photos/vang-vieng-paramotor.jpg", date:"2026-06-15", country:"Laos", place:"Vang Vieng", title:"Up over Vang Vieng", caption:"The newest chapter: harnessed in, airborne, and apparently having a wonderful time.", focus:"center" },
  { id:"vang-vieng-paraglider", stopId:31, src:"/travel-photos/vang-vieng-paraglider.jpg", date:"2026-06-15", country:"Laos", place:"Vang Vieng", title:"Big sky day", caption:"A tiny glider against huge Laos scenery.", focus:"center" },
  { id:"vang-vieng-karst-balloon", stopId:31, src:"/travel-photos/vang-vieng-karst-balloon.jpg", date:"2026-06-15", country:"Laos", place:"Vang Vieng", title:"Karst from above", caption:"Green ridges, blue sky, and the sort of photo that earns the worried-parent refresh.", focus:"center" },
];

const LEG_ICONS = {flight:"✈️",ferry:"⛴️",bus:"🚌",mixed:"🔀",cruise:"⛵",trek:"🥾",taxi:"🚕",train:"🚂"};
const LEG_LABELS = {flight:"Flight",ferry:"Ferry / boat",bus:"Bus / minivan",mixed:"Mixed",cruise:"Cruise / liveaboard",trek:"Trek",taxi:"Taxi / transfer",train:"Train"};

// ── Helpers ───────────────────────────────────────────────────────────────────
const pD = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const dB = (a,b) => Math.round((new Date(b).setHours(0,0,0,0)-new Date(a).setHours(0,0,0,0))/(864e5));
const fD = s => pD(s).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
const gc = country => (COUNTRIES.find(x=>country.includes(x.name))||{c:"#6B7280"}).c;
const SIG = {good:{c:"#22C55E",l:"Good signal"},moderate:{c:"#EAB308",l:"Patchy signal"},poor:{c:"#EF4444",l:"Limited / no signal"}};

const TZ_NAMES = {7:"ICT (Indochina)",8:"SGT/WITA",10:"AEST"};
const TZ_LABELS = {7:"+6 hrs from UK (BST)",8:"+7 hrs from UK (BST)",10:"+9 hrs from UK (BST)"};
function localTime(utcOffset, date) {
  const utc = date.getTime() + date.getTimezoneOffset()*60000;
  const local = new Date(utc + utcOffset*3600000);
  const h = local.getHours(), m = local.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  const mm = m.toString().padStart(2,"0");
  const day = local.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  return { time: `${h12}:${mm}${ampm}`, h24: h, day };
}

export default function App() {
  const [today, setToday] = useState(()=>new Date());
  const [clock, setClock] = useState(()=>new Date());
  useEffect(()=>{
    const tick = () => setToday(new Date());
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime() - now.getTime();
    const firstTimeout = setTimeout(()=>{ tick(); const id = setInterval(tick, 86400000); return ()=>clearInterval(id); }, msToMidnight);
    return ()=>clearTimeout(firstTimeout);
  },[]);
  useEffect(()=>{
    const id = setInterval(()=>setClock(new Date()), 60000);
    return ()=>clearInterval(id);
  },[]);
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("timeline");
  const [demo, setDemo] = useState(false);
  const [demoD, setDemoD] = useState("2026-04-10");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({x:0,y:0});
  const ref = useRef(null);

  const eff = demo ? pD(demoD) : today;
  const ts = pD(TRIP_START), te = pD(TRIP_END);
  const td = dB(ts,te), tripDay = Math.max(0,dB(ts,eff)+1);
  const prog = Math.min(100,Math.max(0,(tripDay/td)*100));
  const before = eff<ts, after = eff>=te;

  const ci = STOPS.findIndex(s => eff>=pD(s.dates[0]) && eff<pD(s.dates[1]));
  const cur = ci>=0 ? STOPS[ci] : null;

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if(!q) return STOPS;
    return STOPS.filter(s=>[s.loc,s.country,s.insight,s.parentTip,s.leg.from,s.leg.to,s.leg.detail].join(" ").toLowerCase().includes(q));
  },[search]);

  const cProg = COUNTRIES.map(c=>{
    const ss=STOPS.filter(s=>s.country===c.name);
    const done=ss.filter(s=>eff>=pD(s.dates[1])).length;
    const act=ss.some(s=>eff>=pD(s.dates[0])&&eff<pD(s.dates[1]));
    const n=ss.reduce((a,s)=>a+s.nights,0);
    return {...c,total:ss.length,done,act,n};
  }).filter(c=>c.total>0);

  const lows = STOPS.filter(s=>s.signal==="poor");
  const confirms = STOPS.filter(s=>s.confirm);
  const longest = STOPS
    .filter(s=>s.country!=="Transit")
    .reduce((best,s)=>s.nights>best.nights?s:best,{nights:0,loc:""});
  const photosByStop = useMemo(()=>{
    const map = new Map();
    TRAVEL_PHOTOS.forEach(photo=>{
      if(!map.has(photo.stopId)) map.set(photo.stopId, []);
      map.get(photo.stopId).push(photo);
    });
    return map;
  },[]);
  const sortedPhotos = [...TRAVEL_PHOTOS].sort((a,b)=>pD(a.date)-pD(b.date));
  const latestPhoto = sortedPhotos.filter(photo=>pD(photo.date)<=eff).at(-1) || sortedPhotos[0];
  const currentPhotos = cur ? (photosByStop.get(cur.id) || []) : [];
  const heroPhoto = currentPhotos[0] || latestPhoto;

  useEffect(()=>{
    if(ref.current&&tab==="timeline") setTimeout(()=>ref.current?.scrollIntoView({behavior:"smooth",block:"center"}),300);
  },[tab]);

  const S = (overrides) => overrides; // just pass style objects directly

  // ── Shared styles ─────────────────────────────────────────────────────────
  const card = {background:"white",border:"1px solid #E5E5E5",borderRadius:16,padding:"14px 16px",marginBottom:8};
  const pill = (bg,col,bor) => ({display:"inline-flex",alignItems:"center",gap:4,background:bg,color:col,border:`1px solid ${bor}`,borderRadius:20,padding:"3px 10px",fontSize:14,fontWeight:700});
  const heroBackground = heroPhoto
    ? `linear-gradient(135deg, rgba(17,30,43,0.88) 0%, rgba(27,40,56,0.72) 48%, rgba(58,90,110,0.55) 100%), url("${heroPhoto.src}")`
    : "linear-gradient(135deg,#1B2838 0%,#2D4156 50%,#3A5A6E 100%)";

  return (
    <div style={{minHeight:"100vh",background:"#FAF7F2",fontFamily:"'Segoe UI','SF Pro Display',system-ui,sans-serif",color:"#1a1a1a",paddingBottom:20}}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <div style={{background:heroBackground,backgroundSize:"cover",backgroundPosition:heroPhoto?.focus || "center",color:"white",padding:"28px 20px 24px",borderRadius:"0 0 28px 28px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <h1 style={{fontSize:28,fontWeight:800,margin:0,letterSpacing:"-0.5px"}}>Pippa, Abi, Lily & Lucy</h1>
              <p style={{fontSize:16,opacity:0.6,margin:"3px 0 0"}}>SE Asia · Apr–Jul 2026</p>
            </div>
            <div style={{background:before?"rgba(255,255,255,0.15)":after?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.25)",padding:"4px 12px",borderRadius:20,fontSize:13,fontWeight:700,letterSpacing:"0.5px",border:"1px solid rgba(255,255,255,0.15)"}}>
              {before?"DEPARTING SOON":after?"TRIP COMPLETE ✓":"● LIVE"}
            </div>
          </div>

          {cur && !before && !after ? (
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <div style={{fontSize:36,lineHeight:1}}>{cur.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,textTransform:"uppercase",letterSpacing:"1px",opacity:0.6,fontWeight:700}}>Currently at</div>
                  <div style={{fontSize:22,fontWeight:700}}>{cur.loc}</div>
                  <div style={{fontSize:14,opacity:0.7,marginTop:2}}>{cur.country} · Day {tripDay} of {td}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                    <div style={{width:7,height:7,borderRadius:4,background:SIG[cur.signal].c}} />
                    <span style={{fontSize:13,opacity:0.8}}>{SIG[cur.signal].l}</span>
                  </div>
                  <div style={{fontSize:14,opacity:0.5,marginTop:3}}>{cur.nights}n · {fD(cur.dates[0])}–{fD(cur.dates[1])}</div>
                </div>
              </div>
              {(()=>{
                const lt = localTime(cur.tz, demo ? new Date() : clock);
                const isNight = lt.h24 >= 22 || lt.h24 < 6;
                const isSleepy = lt.h24 >= 0 && lt.h24 < 8;
                return (
                  <div style={{marginTop:10,background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:20}}>{isNight ? "🌙" : lt.h24 < 12 ? "🌅" : lt.h24 < 17 ? "☀️" : "🌇"}</span>
                      <div>
                        <div style={{fontSize:18,fontWeight:700}}>{lt.time} <span style={{fontSize:13,opacity:0.6,fontWeight:500}}>local time</span></div>
                        <div style={{fontSize:12,opacity:0.5}}>{lt.day} · {TZ_NAMES[cur.tz]} · UTC+{cur.tz}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,opacity:0.6}}>{TZ_LABELS[cur.tz]}</div>
                      {isSleepy && <div style={{fontSize:12,opacity:0.7,marginTop:2}}>💤 Probably asleep</div>}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : before ? (
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:34}}>✈️</div>
              <div style={{fontSize:18,fontWeight:600,marginTop:6}}>Departing in {dB(eff,ts)} days</div>
              <div style={{fontSize:14,opacity:0.6}}>Gatwick South Terminal · Norse Z0791 · 05 Apr at 16:00</div>
            </div>
          ) : (
            <div style={{background:"rgba(16,185,129,0.15)",borderRadius:16,padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:34}}>🏠</div>
              <div style={{fontSize:18,fontWeight:600,marginTop:6}}>Journey Complete</div>
              <div style={{fontSize:14,opacity:0.6}}>{td} days · {cProg.length} countries · Lifetime of memories</div>
            </div>
          )}

          {heroPhoto && (
            <div style={{marginTop:10,display:"flex",gap:10,alignItems:"center",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.16)",borderRadius:14,padding:"8px 10px",backdropFilter:"blur(6px)"}}>
              <img src={heroPhoto.src} alt={heroPhoto.title} style={{width:58,height:58,borderRadius:10,objectFit:"cover",border:"1px solid rgba(255,255,255,0.2)",flex:"0 0 auto"}} />
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1px",opacity:0.62,fontWeight:800}}>Latest postcard</div>
                <div style={{fontSize:15,fontWeight:800,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{heroPhoto.title}</div>
                <div style={{fontSize:12,opacity:0.68,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{heroPhoto.place} · {fD(heroPhoto.date)}</div>
              </div>
            </div>
          )}

          <div style={{marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,opacity:0.45,marginBottom:3}}><span>Gatwick</span><span>{FINAL_DESTINATION}</span></div>
            <div style={{height:4,background:"rgba(255,255,255,0.12)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#E85D3A,#D4A843,#2D9B83,#F97316,#10B981)",borderRadius:2,transition:"width 0.5s"}} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ───────────────────────────────────────────────────────── */}
      <div style={{padding:"14px 16px 0"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
          <label style={{display:"flex",alignItems:"center",gap:8,background:demo?"#FEF3C7":"white",border:`1.5px solid ${demo?"#F59E0B":"#E5E5E5"}`,borderRadius:12,padding:"10px 16px",fontSize:16,fontWeight:600,cursor:"pointer"}}>
            <input type="checkbox" checked={demo} onChange={e=>setDemo(e.target.checked)} style={{width:18,height:18}} />
            ⏰ Time Travel
          </label>
          {demo && <input type="date" value={demoD} onChange={e=>setDemoD(e.target.value)} min={TRIP_START} max={TRIP_END} style={{border:"1.5px solid #D1D5DB",borderRadius:12,padding:"10px 14px",fontSize:16}} />}
          <div style={{flex:1,minWidth:160,position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:20,opacity:0.4}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stops, countries..." style={{width:"100%",border:"1.5px solid #E5E5E5",borderRadius:12,padding:"10px 14px 10px 38px",fontSize:16,background:"white",boxSizing:"border-box"}} />
          </div>
        </div>

        {/* Country pills */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6}}>
          {cProg.map(c=>(
            <div key={c.name} style={{background:c.act?`${c.c}12`:"white",border:`1.5px solid ${c.act?c.c:"#E5E5E5"}`,borderRadius:12,padding:"8px 14px",minWidth:"fit-content",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:20}}>{c.flag}</span>
              <span style={{fontSize:15,fontWeight:700,color:c.act?c.c:"#6B7280"}}>{c.done}/{c.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div style={{padding:"12px 16px 2px",display:"flex",gap:8,overflowX:"auto"}}>
        {[["timeline","📋 Timeline"],["postcards","📸 Postcards"],["legs","🚀 Legs"],["map","🗺️ Route"],["stats","📊 Stats"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setTab(v); if(v!=="timeline") window.scrollTo({top:0,behavior:"smooth"});}} style={{minWidth:116,padding:"12px 0",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",background:tab===v?"#1B2838":"white",color:tab===v?"white":"#6B7280",border:tab===v?"none":"1.5px solid #E5E5E5",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>

      {/* ── TIMELINE ───────────────────────────────────────────────────────── */}
      {tab==="timeline" && (
        <div style={{padding:"14px 16px"}}>
          {filtered.map((s,i)=>{
            const start=pD(s.dates[0]),end=pD(s.dates[1]);
            const isAct=!before&&!after&&eff>=start&&eff<end;
            const isPast=eff>=end;
            const isExp=sel===s.id;
            const col=gc(s.country);
            const showH = i===0 || s.country!==filtered[i-1]?.country;
            const stopPhotos = photosByStop.get(s.id) || [];

            return (
              <div key={s.id}>
                {showH && s.country!=="Transit" && (
                  <div style={{display:"flex",alignItems:"center",gap:8,margin:"18px 0 10px"}}>
                    <div style={{height:2,flex:1,background:`linear-gradient(90deg,${col},transparent)`}} />
                    <span style={{fontSize:16,fontWeight:800,color:col,letterSpacing:"0.5px"}}>{COUNTRIES.find(c=>c.name===s.country)?.flag} {s.country}</span>
                    <div style={{height:2,flex:1,background:`linear-gradient(270deg,${col},transparent)`}} />
                  </div>
                )}

                <div ref={isAct?ref:null} onClick={()=>setSel(isExp?null:s.id)} style={{
                  background:isAct?`${col}08`:"white",border:isAct?`2px solid ${col}`:"1px solid #E8E8E8",
                  borderRadius:16,padding:"12px 14px",marginBottom:8,cursor:"pointer",
                  opacity:isPast?0.5:1,position:"relative",transition:"all 0.2s"
                }}>
                  {isAct && <div style={{position:"absolute",top:-1,right:14,background:col,color:"white",fontSize:12,fontWeight:800,padding:"2px 10px 3px",borderRadius:"0 0 8px 8px",letterSpacing:"1px"}}>NOW</div>}

                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:28,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:isAct?`${col}15`:isPast?"#F3F4F6":"#FAFAFA"}}>
                      {isPast?"✓":s.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:18,fontWeight:700,lineHeight:1.2}}>{s.loc}</div>
                      <div style={{fontSize:14,color:"#888",marginTop:2,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                        <span>{fD(s.dates[0])} – {fD(s.dates[1])}</span>
                        <span>·</span>
                        <span>{s.nights>0?`${s.nights}n`:"Transit"}</span>
                        <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
                          <span style={{width:6,height:6,borderRadius:3,background:SIG[s.signal].c,display:"inline-block"}} />
                          <span style={{fontSize:13}}>{SIG[s.signal].l}</span>
                        </span>
                      </div>
                    </div>
                    <span style={{fontSize:20,transform:isExp?"rotate(90deg)":"none",transition:"transform 0.2s",color:"#aaa"}}>›</span>
                  </div>

                  {stopPhotos.length>0 && (
                    <div style={{display:"flex",gap:8,overflowX:"auto",marginTop:10,paddingBottom:2}}>
                      {stopPhotos.slice(0,4).map(photo=>(
                        <div key={photo.id} style={{minWidth:92,maxWidth:92}}>
                          <img src={photo.src} alt={photo.title} loading="lazy" style={{width:92,height:68,borderRadius:10,objectFit:"cover",display:"block"}} />
                          <div style={{fontSize:11,color:"#6B7280",fontWeight:700,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{photo.title}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExp && (
                    <div style={{marginTop:14,borderTop:"1px solid #E8E8E8",paddingTop:14}} onClick={e=>e.stopPropagation()}>
                      {/* Insight */}
                      <div style={{background:"#FFF8F0",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:`3px solid ${col}`}}>
                        <div style={{fontSize:13,fontWeight:700,color:col,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>What they'll experience</div>
                        <p style={{fontSize:17,lineHeight:1.6,margin:0,color:"#333"}}>{s.insight}</p>
                      </div>

                      {/* Parent tip */}
                      <div style={{background:"#F0F7FF",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid #3B82F6"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#3B82F6",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Parent's note</div>
                        <p style={{fontSize:17,lineHeight:1.6,margin:0,color:"#333"}}>{s.parentTip}</p>
                      </div>

                      {/* Local time */}
                      <div style={{background:"#F0FDF4",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid #16A34A",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#16A34A",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>🕐 Local timezone</div>
                          <div style={{fontSize:16,color:"#333"}}>{TZ_NAMES[s.tz]} · UTC+{s.tz}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:15,fontWeight:600,color:"#333"}}>{s.tz - 1}hrs ahead of UK</div>
                          <div style={{fontSize:13,color:"#666"}}>(UK is on BST Apr–Jul)</div>
                        </div>
                      </div>

                      {/* Transport leg */}
                      <div style={{background:"#F5F3FF",borderRadius:12,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid #8B5CF6"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#8B5CF6",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Getting here</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <span style={pill("#F5F3FF","#6D28D9","#DDD6FE")}>
                            <span>{LEG_ICONS[s.leg.mode]}</span> {LEG_LABELS[s.leg.mode]}
                          </span>
                        </div>
                        <p style={{fontSize:16,fontWeight:600,margin:"0 0 2px",color:"#333"}}>{s.leg.from} → {s.leg.to}</p>
                        <p style={{fontSize:16,lineHeight:1.5,margin:0,color:"#555"}}>{s.leg.detail}</p>
                      </div>

                      {/* Confirm flag */}
                      {s.confirm && (
                        <div style={{background:"#FEF3C7",borderRadius:12,padding:"10px 14px",border:"1px solid #FCD34D",display:"flex",alignItems:"flex-start",gap:8}}>
                          <span style={{fontSize:18}}>⚠️</span>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"#92400E",textTransform:"uppercase",letterSpacing:"0.5px"}}>Needs confirmation</div>
                            <p style={{fontSize:16,lineHeight:1.5,margin:"4px 0 0",color:"#78350F"}}>{s.confirm}</p>
                          </div>
                        </div>
                      )}

                      {/* Signal warning */}
                      {s.signal==="poor" && (
                        <div style={{background:"#FEF2F2",borderRadius:12,padding:"10px 14px",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:18}}>📵</span>
                          <span style={{fontSize:16,color:"#991B1B",fontWeight:600}}>Expect limited contact here — don't worry!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── POSTCARDS ──────────────────────────────────────────────────────── */}
      {tab==="postcards" && (
        <div style={{padding:"14px 16px"}}>
          {heroPhoto && (
            <div style={{...card,padding:0,overflow:"hidden",borderRadius:18,boxShadow:"0 12px 28px rgba(27,40,56,0.12)"}}>
              <div style={{position:"relative",minHeight:280,backgroundImage:`linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72)),url("${heroPhoto.src}")`,backgroundSize:"cover",backgroundPosition:heroPhoto.focus || "center",display:"flex",alignItems:"flex-end"}}>
                <div style={{padding:"20px",color:"white",width:"100%"}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.16)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:999,padding:"5px 10px",fontSize:12,fontWeight:800,letterSpacing:"0.7px",textTransform:"uppercase",marginBottom:10}}>📸 Featured now</div>
                  <div style={{fontSize:26,fontWeight:900,lineHeight:1.05}}>{heroPhoto.title}</div>
                  <div style={{fontSize:14,opacity:0.78,marginTop:6}}>{heroPhoto.place} · {fD(heroPhoto.date)}</div>
                  <p style={{fontSize:15,lineHeight:1.45,margin:"10px 0 0",maxWidth:520,opacity:0.92}}>{heroPhoto.caption}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:12}}>
            {TRAVEL_PHOTOS.map(photo=>{
              const linkedStop = STOPS.find(s=>s.id===photo.stopId);
              const col = gc(photo.country);
              return (
                <div key={photo.id} style={{background:"white",border:"1px solid #E5E5E5",borderRadius:14,overflow:"hidden",boxShadow:"0 6px 18px rgba(27,40,56,0.06)"}}>
                  <img src={photo.src} alt={photo.title} loading="lazy" style={{width:"100%",aspectRatio:"4 / 5",objectFit:"cover",display:"block",background:"#E5E7EB"}} />
                  <div style={{padding:"10px 10px 12px"}}>
                    <div style={{fontSize:14,fontWeight:850,lineHeight:1.2,color:"#1B2838"}}>{photo.title}</div>
                    <div style={{fontSize:12,color:"#6B7280",fontWeight:650,marginTop:4}}>{photo.place} · {fD(photo.date)}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                      <span style={{width:8,height:8,borderRadius:4,background:col,display:"inline-block"}} />
                      <span style={{fontSize:11,color:"#888",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{linkedStop?.loc || photo.country}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEGS ───────────────────────────────────────────────────────────── */}
      {tab==="legs" && (
        <div style={{padding:"14px 16px"}}>
          <div style={{...card,background:"#F5F3FF",border:"1px solid #DDD6FE",marginBottom:16}}>
            <div style={{fontSize:17,fontWeight:700,color:"#6D28D9",marginBottom:4}}>Every move in plain English</div>
            <p style={{fontSize:16,lineHeight:1.6,margin:0,color:"#4C1D95"}}>From easy taxi hops to faff-heavy multi-mode transfers — here's how each connection works so you know what kind of travel day they're having.</p>
          </div>
          {filtered.map(s=>(
            <div key={s.id} style={{...card,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{fontSize:26,marginTop:2}}>{LEG_ICONS[s.leg.mode]}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:17,fontWeight:700}}>{s.leg.from} → {s.leg.to}</span>
                  <span style={pill("#F5F3FF","#6D28D9","#DDD6FE")}>{LEG_LABELS[s.leg.mode]}</span>
                </div>
                <p style={{fontSize:16,lineHeight:1.5,margin:"0 0 4px",color:"#555"}}>{s.leg.detail}</p>
                <div style={{fontSize:14,color:"#888"}}>Arriving into <strong>{s.loc}</strong> · {fD(s.dates[0])}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MAP ────────────────────────────────────────────────────────────── */}
      {tab==="map" && (
        <div style={{padding:"14px 16px"}}>
          <div style={{...card,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:18,fontWeight:700}}>Route Overview</div>
                <p style={{fontSize:14,color:"#888",margin:"4px 0 0"}}>{STOPS.length} stops · Pinch or use buttons to zoom · Tap dots to jump</p>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setZoom(z=>Math.min(z*1.5,5));}} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #E5E5E5",background:"white",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                <button onClick={()=>{setZoom(z=>Math.max(z/1.5,1));if(zoom<=1.5)setPan({x:0,y:0});}} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #E5E5E5",background:"white",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                {zoom>1 && <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{height:36,borderRadius:10,border:"1.5px solid #E5E5E5",background:"white",fontSize:14,cursor:"pointer",padding:"0 12px",fontWeight:600,color:"#666"}}>Reset</button>}
              </div>
            </div>
            <div style={{overflow:"hidden",borderRadius:12,border:"1px solid #E0E0E0",touchAction:zoom>1?"none":"auto"}}
              onMouseDown={e=>{if(zoom>1){setDragging(true);setDragStart({x:e.clientX-pan.x,y:e.clientY-pan.y});}}}
              onMouseMove={e=>{if(dragging){setPan({x:e.clientX-dragStart.x,y:e.clientY-dragStart.y});}}}
              onMouseUp={()=>setDragging(false)}
              onMouseLeave={()=>setDragging(false)}
              onTouchStart={e=>{if(zoom>1&&e.touches.length===1){const t=e.touches[0];setDragging(true);setDragStart({x:t.clientX-pan.x,y:t.clientY-pan.y});}}}
              onTouchMove={e=>{if(dragging&&e.touches.length===1){e.preventDefault();const t=e.touches[0];setPan({x:t.clientX-dragStart.x,y:t.clientY-dragStart.y});}}}
              onTouchEnd={()=>setDragging(false)}
            >
              <svg viewBox="0 0 400 340" style={{width:"100%",display:"block",cursor:zoom>1?(dragging?"grabbing":"grab"):"default",transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,transformOrigin:"center center",transition:dragging?"none":"transform 0.3s"}}>
                <rect x="0" y="0" width="400" height="340" fill="#E8F4F8" rx="12" />
                <ellipse cx="200" cy="200" rx="180" ry="160" fill="#D4E8F0" opacity="0.5" />
                {STOPS.slice(1).map((s,i)=>{
                  const p=STOPS[i];
                  const x1=((p.lng-95)/60)*360+20, y1=((25-p.lat)/45)*320+10;
                  const x2=((s.lng-95)/60)*360+20, y2=((25-s.lat)/45)*320+10;
                  const done=eff>=pD(s.dates[1]);
                  return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={done?"#9CA3AF":gc(s.country)} strokeWidth={done?1:1.5} strokeDasharray={done?"none":"4,3"} opacity={0.6} />;
                })}
                {STOPS.map((s,i)=>{
                  const x=((s.lng-95)/60)*360+20, y=((25-s.lat)/45)*320+10;
                  const isA=!before&&!after&&eff>=pD(s.dates[0])&&eff<pD(s.dates[1]);
                  const done=eff>=pD(s.dates[1]);
                  const col=gc(s.country);
                  const showLabel = zoom>=2 || isA || s.nights>=4;
                  const showAllLabels = zoom>=3;
                  return (
                    <g key={`d${i}`} onClick={()=>{setSel(s.id);setTab("timeline");}} style={{cursor:"pointer"}}>
                      {isA && <>
                        <circle cx={x} cy={y} r={10/zoom} fill={col} opacity={0.15}><animate attributeName="r" values={`${8/zoom};${14/zoom};${8/zoom}`} dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" /></circle>
                        <circle cx={x} cy={y} r={5/zoom} fill={col} stroke="white" strokeWidth={2/zoom} />
                      </>}
                      {!isA && <circle cx={x} cy={y} r={done?2.5/zoom:3.5/zoom} fill={done?"#9CA3AF":col} opacity={done?0.4:0.8} />}
                      {(showAllLabels||showLabel) && <text x={x} y={y-8/zoom} textAnchor="middle" fontSize={6/zoom} fontWeight="600" fill={isA?col:"#666"}>{s.loc.split(",")[0].split("/")[0].split("(")[0].trim().substring(0,14)}</text>}
                    </g>
                  );
                })}
                <text x="90" y="38" fontSize={7/zoom} fill="#E85D3A" fontWeight="700" opacity="0.4">THAILAND</text>
                <text x="55" y="68" fontSize={6/zoom} fill="#2D9B83" fontWeight="700" opacity="0.4">LAOS</text>
                <text x="115" y="52" fontSize={6/zoom} fill="#D4A843" fontWeight="700" opacity="0.4">VIETNAM</text>
                <text x="80" y="155" fontSize={6/zoom} fill="#8B5CF6" fontWeight="700" opacity="0.4">CAMBODIA</text>
                <text x="55" y="225" fontSize={6/zoom} fill="#3B82F6" fontWeight="700" opacity="0.4">MALAYSIA</text>
                <text x="175" y="245" fontSize={6/zoom} fill="#F97316" fontWeight="700" opacity="0.4">INDONESIA</text>
              </svg>
            </div>
            {zoom>1 && <p style={{fontSize:13,color:"#888",textAlign:"center",marginTop:8}}>Drag to pan · Zoom: {Math.round(zoom*100)}%</p>}
          </div>

          {/* Itinerary analysis */}
          <div style={{marginTop:14}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6,paddingLeft:4}}>📖 Reading of the itinerary</div>
            <p style={{fontSize:14,color:"#888",margin:"0 0 10px 4px"}}>Assessment of the plan's structure — not related to map colours above.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {bg:"#F8FAFC",bc:"#475569",tc:"#1E293B",icon:"✅",h:"Strength",t:"The new last leg still has good pauses: Koh Tao, Gili Trawangan, Ubud and a five-night Canggu landing pad."},
                {bg:"#FFFBEB",bc:"#B45309",tc:"#78350F",icon:"⚡",h:"Pressure point",t:"Two travel nights are implied: Bangkok to Koh Samui and Koh Tao to George Town. Expect slower replies around those moves."},
                {bg:"#EEF2FF",bc:"#6366F1",tc:"#312E81",icon:"💙",h:"Most reassuring",t:"The route finishes with shorter Bali hops and five nights in Canggu, which should reduce end-of-trip fatigue."},
                {bg:"#FFF1F2",bc:"#E11D48",tc:"#881337",icon:"😰",h:"Most anxious",t:"Island ferries, the overnight train, party-island choices and Bali scooter traffic are the practical watch-points now."},
              ].map((x,i)=>(
                <div key={i} style={{background:x.bg,borderRadius:12,padding:"12px 14px",borderLeft:`3px solid ${x.bc}`}}>
                  <div style={{fontSize:14,fontWeight:700,color:x.bc,marginBottom:6}}>{x.icon} {x.h}</div>
                  <p style={{fontSize:15,lineHeight:1.5,margin:0,color:x.tc}}>{x.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      {tab==="stats" && (
        <div style={{padding:"14px 16px"}}>
          {/* Quick stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[
              {l:"Total Days",v:td,i:"📅"},{l:"Countries",v:cProg.length,i:"🌏"},
              {l:"Stops",v:STOPS.length,i:"📍"},{l:"Day of Trip",v:before?"—":after?"Done!":tripDay,i:"⏱️"},
              {l:"Longest Stay",v:`${longest.nights} nights`,i:"🏖️",sub:longest.loc},{l:"Low Signal",v:lows.length+" stops",i:"📵"},
            ].map((x,i)=>(
              <div key={i} style={{...card,textAlign:"center",padding:"14px 12px"}}>
                <div style={{fontSize:26,marginBottom:4}}>{x.i}</div>
                <div style={{fontSize:26,fontWeight:800,color:"#1B2838"}}>{x.v}</div>
                <div style={{fontSize:13,color:"#888",fontWeight:600}}>{x.l}</div>
                {x.sub && <div style={{fontSize:13,color:"#aaa"}}>{x.sub}</div>}
              </div>
            ))}
          </div>

          {/* Country breakdown */}
          <div style={{fontSize:18,fontWeight:700,marginBottom:10,paddingLeft:4}}>🌏 By Country</div>
          {cProg.map(c=>(
            <div key={c.name} style={{...card,display:"flex",alignItems:"center",gap:12,border:`1px solid ${c.act?c.c:"#E8E8E8"}`}}>
              <span style={{fontSize:28}}>{c.flag}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:700}}>{c.name}</div>
                <div style={{fontSize:14,color:"#888"}}>{c.total} stops · {c.n} nights</div>
                <div style={{height:4,background:"#F3F4F6",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(c.done/c.total)*100}%`,background:c.c,borderRadius:2,transition:"width 0.5s"}} />
                </div>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:c.c}}>{c.done===c.total?"✓":`${c.done}/${c.total}`}</div>
            </div>
          ))}

          {/* Low signal */}
          <div style={{fontSize:18,fontWeight:700,margin:"18px 0 10px",paddingLeft:4}}>📵 Low Signal Stops</div>
          <p style={{fontSize:16,color:"#666",margin:"0 0 8px 4px"}}>Where silence is a signal issue, not a disaster.</p>
          {lows.map(s=>(
            <div key={s.id} style={{background:"#FEF2F2",borderRadius:12,padding:"10px 14px",marginBottom:6,border:"1px solid #FECACA",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:600}}>{s.loc}</div>
                <div style={{fontSize:14,color:"#991B1B"}}>{fD(s.dates[0])} – {fD(s.dates[1])}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:4,background:"#EF4444"}} />
            </div>
          ))}

          {/* Confirm items */}
          {confirms.length>0 && <>
            <div style={{fontSize:18,fontWeight:700,margin:"18px 0 10px",paddingLeft:4}}>⚠️ Items to Confirm</div>
            {confirms.map(s=>(
              <div key={s.id} style={{background:"#FEF3C7",borderRadius:12,padding:"10px 14px",marginBottom:6,border:"1px solid #FCD34D"}}>
                <div style={{fontSize:16,fontWeight:700,color:"#92400E"}}>{s.loc}</div>
                <p style={{fontSize:16,lineHeight:1.5,margin:"4px 0 0",color:"#78350F"}}>{s.confirm}</p>
              </div>
            ))}
          </>}

          {/* Travellers */}
          <div style={{fontSize:18,fontWeight:700,margin:"18px 0 10px",paddingLeft:4}}>👩‍👩‍👧‍👧 The Travellers</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {["Pippa","Abi","Lily","Lucy"].map((n,i)=>(
              <div key={n} style={{...card,textAlign:"center",padding:14}}>
                <div style={{width:42,height:42,borderRadius:21,margin:"0 auto 8px",background:["#E85D3A","#2D9B83","#D4A843","#8B5CF6"][i],display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:22}}>{n[0]}</div>
                <div style={{fontSize:17,fontWeight:700}}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div style={{padding:20,textAlign:"center"}}>
        <p style={{fontSize:13,color:"#aaa",margin:0}}>Built with love for worried parents everywhere 💛</p>
      </div>
    </div>
  );
}
