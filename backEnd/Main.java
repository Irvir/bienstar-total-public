import com.google.gson.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Bienvenido al sistema de búsqueda de alimentos.");
        System.out.println("Ingrese el nombre del alimento que desea buscar:");
        String foodName = sc.nextLine();

        try {
            String key = "B3yQxo791LDmqc3scyEY8ru2kHJabUC661InCwXg";

            String endpoint = "https://api.nal.usda.gov/fdc/v1/foods/search?query="
                    + foodName + "&api_key=" + key;

            URL url = new URL(endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder content = new StringBuilder();
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();

            // Parsear JSON
            JsonObject json = JsonParser.parseString(content.toString()).getAsJsonObject();
            JsonArray foods = json.getAsJsonArray("foods");

            if (foods.size() > 0) {
                JsonObject food = foods.get(0).getAsJsonObject(); // tomamos el primero de la lista

                String description = food.get("description").getAsString();

                // El USDA devuelve nutrientes en "foodNutrients"
                JsonArray nutrients = food.getAsJsonArray("foodNutrients");

                String calories = "N/A", protein = "N/A", fat = "N/A", carbs = "N/A";
                for (JsonElement elem : nutrients) {
                    JsonObject nut = elem.getAsJsonObject();
                    String nutrientName = nut.get("nutrientName").getAsString();
                    String value = nut.get("value").getAsString();

                    if (nutrientName.equalsIgnoreCase("Energy")) calories = value + " kcal";
                    else if (nutrientName.equalsIgnoreCase("Protein")) protein = value + " g";
                    else if (nutrientName.equalsIgnoreCase("Total lipid (fat)")) fat = value + " g";
                    else if (nutrientName.equalsIgnoreCase("Carbohydrate, by difference")) carbs = value + " g";
                }

                System.out.println("\n=== Información del alimento ===");
                System.out.println("Nombre: " + description);
                System.out.println("Calorías: " + calories);
                System.out.println("Proteínas: " + protein);
                System.out.println("Grasas: " + fat);
                System.out.println("Carbohidratos: " + carbs);
            } else {
                System.out.println("No se encontró el alimento.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
