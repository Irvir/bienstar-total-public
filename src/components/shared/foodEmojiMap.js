// Mapea nombres comunes de alimentos (ES) a codepoints Twemoji (en minúsculas, base16, guiones si son múltiples)
// Referencia: https://twemoji.twitter.com/

const MAP = [
  // Frutas
  { keys: ["manzana", "apple"], code: "1f34e" },
  { keys: ["banana", "plátano", "platano"], code: "1f34c" },
  { keys: ["pera", "pear"], code: "1f350" },
  { keys: ["uva", "uvas", "grape", "grapes"], code: "1f347" },
  { keys: ["naranja", "orange", "mandarina", "tangerine"], code: "1f34a" },
  { keys: ["pomelo", "toronja", "grapefruit"], code: "1f34a" },
  { keys: ["limón", "limon", "lemon"], code: "1f34b" },
  { keys: ["lima", "lime"], code: "1f34b" },
  { keys: ["frutilla", "fresa", "strawberry"], code: "1f353" },
  { keys: ["sandía", "sandia", "watermelon"], code: "1f349" },
  { keys: ["melón", "melon", "cantaloupe"], code: "1f348" },
  { keys: ["piña", "pina", "pineapple"], code: "1f34d" },
  { keys: ["kiwi"], code: "1f95d" },
  { keys: ["durazno", "melocotón", "melocoton", "peach"], code: "1f351" },
  { keys: ["cereza", "cerezas", "cherry", "cherries"], code: "1f352" },
  { keys: ["mango"], code: "1f96d" },
  { keys: ["arándano", "arandano", "blueberry", "blueberries"], code: "1fad0" },
  { keys: ["frambuesa", "raspberry"], code: "1fad0" },
  { keys: ["maracuyá", "maracuya", "passion"], code: "1f346" }, // approximación uva/berenjena según disponibilidad

  // Verduras y hortalizas
  { keys: ["tomate", "jitomate", "tomato"], code: "1f345" },
  { keys: ["zanahoria", "carrot"], code: "1f955" },
  { keys: ["papa", "patata", "potato"], code: "1f954" },
  { keys: ["camote", "boniato", "sweet potato"], code: "1f360" },
  { keys: ["cebolla", "onion"], code: "1f9c5" },
  { keys: ["ajo", "garlic"], code: "1f9c4" },
  { keys: ["lechuga", "lettuce"], code: "1f96c" }, // leafy green
  { keys: ["espinaca", "espinacas", "spinach"], code: "1f96c" },
  { keys: ["brócoli", "brocoli", "broccoli"], code: "1f966" },
  { keys: ["coliflor", "cauliflower"], code: "1f966" },
  { keys: ["pepino", "cucumber"], code: "1f952" },
  { keys: ["pimiento", "morron", "morrón", "bell pepper"], code: "1fad1" },
  { keys: ["berenjena", "eggplant"], code: "1f346" },
  { keys: ["calabaza", "zapallo", "pumpkin", "squash"], code: "1f383" },
  { keys: ["apio", "celery"], code: "1f96c" },

  // Cereales y derivados
  { keys: ["maíz", "maiz", "elote", "corn"], code: "1f33d" },
  { keys: ["arroz", "rice"], code: "1f35a" },
  { keys: ["pan", "bread"], code: "1f35e" },
  { keys: ["tortilla", "tortillas"], code: "1f32e" },
  { keys: ["fideos", "pasta", "noodles"], code: "1f35d" },
  { keys: ["avena", "oat", "oats"], code: "1f95e" },

  // Lácteos y huevos
  { keys: ["leche", "milk"], code: "1f95b" },
  { keys: ["yogur", "yoghurt", "yogurt"], code: "1f9c1" },
  { keys: ["queso", "cheese"], code: "1f9c0" },
  { keys: ["manteca", "mantequilla", "butter"], code: "1f9c8" },
  { keys: ["huevo", "huevos", "egg", "eggs"], code: "1f95a" },

  // Carnes y pescados
  { keys: ["pollo", "chicken"], code: "1f357" },
  { keys: ["pavo", "turkey"], code: "1f357" },
  { keys: ["carne", "res", "beef", "steak"], code: "1f969" },
  { keys: ["cerdo", "chancho", "pork"], code: "1f969" },
  { keys: ["cordero", "lamb"], code: "1f969" },
  { keys: ["jamón", "jamon", "ham"], code: "1f356" },
  { keys: ["salchicha", "chorizo", "sausage"], code: "1f32d" },
  { keys: ["pescado", "fish"], code: "1f41f" },
  { keys: ["atun", "atún", "tuna"], code: "1f41f" },
  { keys: ["salmón", "salmon"], code: "1f41f" },
  { keys: ["mariscos", "camarón", "camaron", "shrimp"], code: "1f990" },

  // Legumbres y frutos secos
  { keys: ["poroto", "frijol", "alubia", "bean", "beans"], code: "1faba" }, // approximación saco
  { keys: ["garbanzo", "garbanzos", "chickpea"], code: "1faba" },
  { keys: ["lenteja", "lentejas", "lentil", "lentils"], code: "1faba" },
  { keys: ["soja", "soya", "soy"], code: "1faba" },
  { keys: ["maní", "mani", "cacahuate", "peanut", "peanuts"], code: "1f95c" },
  { keys: ["nuez", "nueces", "walnut", "almendra", "almendras", "almond", "almonds"], code: "1f330" },

  // Aceites y grasas (aproximaciones)
  { keys: ["aceite", "oil", "aceituna", "oliva"], code: "1fad2" }, // olive
  { keys: ["palta", "aguacate", "avocado"], code: "1f951" },

  // Azúcares y dulces
  { keys: ["azúcar", "azucar", "sugar"], code: "1f36c" },
  { keys: ["chocolate"], code: "1f36b" },
  { keys: ["miel", "honey"], code: "1f36f" },

  // Bebidas
  { keys: ["agua", "water"], code: "1f9c3" }, // mate/cup as approximation
  { keys: ["café", "cafe", "coffee"], code: "2615" },
  { keys: ["té", "te", "tea"], code: "1f375" },
  { keys: ["jugo", "zumo", "juice"], code: "1f9c3" },
];

export function foodToEmojiCode(foodName) {
  if (!foodName) return null;
  const name = String(foodName).trim().toLowerCase();
  for (const item of MAP) {
    if (item.keys.some((k) => name.includes(k))) return item.code;
  }
  return null;
}

export function twemojiSvgUrlFromCode(code) {
  if (!code) return null;
  // CDN estable
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;
}

export function foodToTwemojiSvg(foodName) {
  const code = foodToEmojiCode(foodName);
  return code ? twemojiSvgUrlFromCode(code) : null;
}

export default foodToTwemojiSvg;
