import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        String apiKey = "B3yQxo791LDmqc3scyEY8ru2kHJabUC661InCwXg"; // <--- API Key de USDA

        String inputFile = "C:\\Users\\marti\\OneDrive\\2.1 - Proyecto Programacion\\BienestarTotal-4HombresYMedio-AUX-\\SacarInfoAlimentos\\src\\main\\java\\org\\example\\AlimentosIngle";   // Archivo con lista de alimentos
        String outputFile = "Resultados.txt"; // <--- Archivo de salida de alimentos

        try (BufferedReader br = new BufferedReader(new FileReader(inputFile));
             BufferedWriter bw = new BufferedWriter(new FileWriter(outputFile))) {

            String foodName;
            while ((foodName = br.readLine()) != null) {
                foodName = foodName.trim();
                if (foodName.isEmpty()) continue;

                System.out.println("Buscando: " + foodName);
                String encodedFoodName = URLEncoder.encode(foodName, StandardCharsets.UTF_8);
                String urlString = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + encodedFoodName + "&api_key=" + apiKey; //

                try {
                    // Conexión HTTP
                    URL url = new URL(urlString);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");

                    // Leer respuesta
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // Parsear JSON
                    Gson gson = new Gson();
                    JsonObject obj = gson.fromJson(response.toString(), JsonObject.class);
                    JsonArray foods = obj.getAsJsonArray("foods");

                    if (foods == null || foods.size() == 0) {
                        bw.write("No se encontró información para: " + foodName + "\n\n");
                        continue;
                    }

                    JsonObject food = foods.get(0).getAsJsonObject();
                    String nombre = food.get("description").getAsString();
                    bw.write("-- Alimento: " + nombre + "\n");

                    JsonArray nutrientes = food.getAsJsonArray("foodNutrients");
                    for (int j = 0; j < nutrientes.size(); j++) {
                        JsonObject nut = nutrientes.get(j).getAsJsonObject();
                        String nutriente = nut.get("nutrientName").getAsString();
                        double valor = nut.has("value") ? nut.get("value").getAsDouble() : 0.0;
                        String unidad = nut.has("unitName") ? nut.get("unitName").getAsString() : "";
                        bw.write("   - " + nutriente + ": " + valor + " " + unidad + "\n");
                    }
                    bw.write("\n");
                    // Separación entre alimentos

                } catch (Exception e) {
                    bw.write("-- Error con alimento: " + foodName + "\n\n");
                    e.printStackTrace();
                }
            }

            System.out.println("Resultados guardados en " + outputFile);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
