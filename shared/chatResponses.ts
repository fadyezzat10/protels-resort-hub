export interface ChatResponse {
  keywords: string[];
  en: string;
  ar: string;
}

export const chatResponses: ChatResponse[] = [
  {
    keywords: ["children", "child", "kids", "kid", "baby", "infant", "toddler", "أطفال", "طفل", "رضيع", "اولاد"],
    en: "Children are welcome at most Protels resorts. Family-friendly facilities including kids clubs and family rooms are available. Policies may vary by resort and room type, and exact details are always shown during the booking process. Click the \"Book Now\" button to see options for your family.",
    ar: "الأطفال مرحب بهم في معظم منتجعات بروتيلز. تتوفر مرافق مناسبة للعائلات تشمل نوادي الأطفال وغرف عائلية. قد تختلف السياسات حسب المنتجع ونوع الغرفة، وتظهر التفاصيل الدقيقة دائماً أثناء عملية الحجز. اضغط على زر \"احجز الآن\" لمعرفة الخيارات المناسبة لعائلتك."
  },
  {
    keywords: ["cancel", "cancellation", "refund", "إلغاء", "الغاء", "استرداد", "استرجاع"],
    en: "Cancellation policies depend on the selected resort and rate type. Some rates are flexible while others may be non-refundable. The exact cancellation rules are always displayed clearly during the booking process. Click \"Book Now\" to review the terms for your preferred dates.",
    ar: "تعتمد سياسات الإلغاء على المنتجع المختار ونوع السعر. بعض الأسعار مرنة والبعض الآخر قد يكون غير قابل للاسترداد. يتم عرض قواعد الإلغاء الدقيقة دائماً بوضوح أثناء عملية الحجز. اضغط على \"احجز الآن\" لمراجعة الشروط للتواريخ المفضلة لديك."
  },
  {
    keywords: ["book", "booking", "reserve", "reservation", "حجز", "احجز", "حجوزات"],
    en: "To make a booking, simply click the \"Book Now\" button at the top of the website. You will be able to select your preferred resort, dates, room type, and see all available rates and policies before confirming.",
    ar: "للحجز، اضغط على زر \"احجز الآن\" في أعلى الموقع. ستتمكن من اختيار المنتجع المفضل لديك والتواريخ ونوع الغرفة ومراجعة جميع الأسعار والسياسات المتاحة قبل التأكيد."
  },
  {
    keywords: ["contact", "phone", "email", "call", "reach", "اتصال", "تواصل", "هاتف", "بريد", "ايميل", "رقم"],
    en: "You can reach us through the contact page on our website for any specific inquiries. For immediate booking assistance, click the \"Book Now\" button to explore our resorts and rates directly.",
    ar: "يمكنكم التواصل معنا من خلال صفحة الاتصال على موقعنا لأي استفسارات محددة. للمساعدة الفورية في الحجز، اضغط على زر \"احجز الآن\" لاستكشاف منتجعاتنا وأسعارنا مباشرة."
  },
  {
    keywords: ["price", "cost", "rate", "how much", "expensive", "cheap", "offer", "discount", "سعر", "تكلفة", "كم", "عرض", "خصم", "أسعار"],
    en: "Rates vary depending on the resort, room type, dates, and current offers. For the most accurate and up-to-date pricing, please click the \"Book Now\" button where you can see all available rates for your preferred dates.",
    ar: "تختلف الأسعار حسب المنتجع ونوع الغرفة والتواريخ والعروض الحالية. للحصول على أدق الأسعار وأحدثها، يرجى الضغط على زر \"احجز الآن\" حيث يمكنكم مشاهدة جميع الأسعار المتاحة للتواريخ المفضلة لديكم."
  },
  {
    keywords: ["crystal beach", "كريستال بيتش"],
    en: "Protels Crystal Beach Resort is located in Marsa Alam, Egypt. It is an all-inclusive luxury resort featuring a private sandy beach, PADI diving center, spa and wellness center, kids club, and infinity pools. Room types include Standard, Superior, Family, and Suite. It is ideal for both families and couples. Click \"Book Now\" to check availability.",
    ar: "يقع منتجع بروتيلز كريستال بيتش في مرسى علم، مصر. وهو منتجع فاخر شامل كلياً يتميز بشاطئ رملي خاص ومركز غوص PADI وسبا ومركز عافية ونادي أطفال وحمامات سباحة لا متناهية. تشمل أنواع الغرف: ستاندرد، سوبيريور، عائلية، وجناح. مثالي للعائلات والأزواج. اضغط \"احجز الآن\" للتحقق من التوافر."
  },
  {
    keywords: ["beach club", "بيتش كلوب"],
    en: "Protels Beach Club & SPA is located in Marsa Alam, Egypt. It is a vibrant all-inclusive resort with an aquapark, multiple swimming pools, private beach, and a full-service wellness center. Perfect for families, couples, and groups of friends. Click \"Book Now\" to check availability.",
    ar: "يقع بروتيلز بيتش كلوب آند سبا في مرسى علم، مصر. وهو منتجع نابض بالحياة شامل كلياً يتميز بأكوا بارك وحمامات سباحة متعددة وشاطئ خاص ومركز عافية متكامل الخدمات. مثالي للعائلات والأزواج ومجموعات الأصدقاء. اضغط \"احجز الآن\" للتحقق من التوافر."
  },
  {
    keywords: ["royal bay", "رويال باي", "hurghada", "الغردقة"],
    en: "Protels Royal Bay Resort & Spa is located in Hurghada, Egypt. It is a premium beachfront resort with a full spa, private beach, and lively entertainment options. Ideal for a memorable Red Sea holiday. Click \"Book Now\" to check availability.",
    ar: "يقع منتجع بروتيلز رويال باي آند سبا في الغردقة، مصر. وهو منتجع متميز على الشاطئ مع سبا متكامل وشاطئ خاص وخيارات ترفيه حية. مثالي لعطلة لا تنسى على البحر الأحمر. اضغط \"احجز الآن\" للتحقق من التوافر."
  },
  {
    keywords: ["la plage", "zanzibar", "زنجبار", "لا بلاج", "tanzania", "تنزانيا"],
    en: "Protels La Plage is located in Zanzibar, Tanzania. It is a boutique beachfront escape on the Indian Ocean offering an intimate, serene atmosphere. Perfect for couples and honeymooners seeking tropical luxury. Click \"Book Now\" to check availability.",
    ar: "يقع بروتيلز لا بلاج في زنجبار، تنزانيا. وهو ملاذ بوتيكي على الشاطئ يطل على المحيط الهندي ويوفر أجواء حميمة وهادئة. مثالي للأزواج ومن يقضون شهر العسل ويبحثون عن رفاهية استوائية. اضغط \"احجز الآن\" للتحقق من التوافر."
  },
  {
    keywords: ["egypt", "مصر", "marsa alam", "مرسى علم", "red sea", "البحر الأحمر"],
    en: "We have three stunning resorts in Egypt. Protels Crystal Beach Resort and Protels Beach Club & SPA are both in Marsa Alam on the Red Sea, while Protels Royal Bay Resort & Spa is in Hurghada. Each offers a unique all-inclusive experience. Click \"Book Now\" to explore availability.",
    ar: "لدينا ثلاثة منتجعات رائعة في مصر. يقع كل من بروتيلز كريستال بيتش ريزورت وبروتيلز بيتش كلوب آند سبا في مرسى علم على البحر الأحمر، بينما يقع بروتيلز رويال باي ريزورت آند سبا في الغردقة. كل منها يقدم تجربة فريدة شاملة كلياً. اضغط \"احجز الآن\" لاستكشاف التوافر."
  },
  {
    keywords: ["resort", "resorts", "hotel", "hotels", "where", "which", "منتجع", "منتجعات", "فندق", "فنادق", "أين", "وين"],
    en: "Protels Hotels & Resorts has four beautiful properties: Crystal Beach Resort and Beach Club & SPA in Marsa Alam, Royal Bay Resort & Spa in Hurghada (all in Egypt), and La Plage in Zanzibar, Tanzania. Each resort offers a unique luxury experience. Would you like to know more about a specific one?",
    ar: "لدى بروتيلز للفنادق والمنتجعات أربعة منتجعات رائعة: كريستال بيتش ريزورت وبيتش كلوب آند سبا في مرسى علم، ورويال باي ريزورت آند سبا في الغردقة (جميعها في مصر)، ولا بلاج في زنجبار، تنزانيا. كل منتجع يقدم تجربة فاخرة فريدة. هل تحب تعرف أكتر عن منتجع معين؟"
  },
  {
    keywords: ["spa", "wellness", "massage", "سبا", "عافية", "مساج", "تدليك"],
    en: "Most of our resorts feature full-service spa and wellness centers where you can enjoy a range of treatments and relaxation experiences. For specific spa services and availability, click \"Book Now\" and select your preferred resort to see all amenities.",
    ar: "تتميز معظم منتجعاتنا بمراكز سبا وعافية متكاملة الخدمات حيث يمكنكم الاستمتاع بمجموعة من العلاجات وتجارب الاسترخاء. لمعرفة خدمات السبا المحددة والتوافر، اضغط \"احجز الآن\" واختر المنتجع المفضل لديك لمشاهدة جميع المرافق."
  },
  {
    keywords: ["diving", "dive", "snorkel", "snorkeling", "reef", "coral", "غوص", "سنوركل", "شعاب", "مرجانية"],
    en: "Protels Crystal Beach Resort in Marsa Alam features a PADI diving center with access to some of the Red Sea's most spectacular coral reefs. Whether you are a beginner or experienced diver, there are options available. Click \"Book Now\" to plan your diving holiday.",
    ar: "يتميز منتجع بروتيلز كريستال بيتش في مرسى علم بمركز غوص PADI مع إمكانية الوصول إلى أروع الشعاب المرجانية في البحر الأحمر. سواء كنت مبتدئاً أو غواصاً محترفاً، هناك خيارات متاحة. اضغط \"احجز الآن\" للتخطيط لعطلة الغوص الخاصة بك."
  }
];

export function findRuleBasedResponse(userMessage: string): { en: string; ar: string } | null {
  const lower = userMessage.toLowerCase();
  for (const response of chatResponses) {
    for (const keyword of response.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return { en: response.en, ar: response.ar };
      }
    }
  }
  return null;
}

export function detectArabicText(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}
