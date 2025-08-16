import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

class Food {
    String name;
    int calories;

    Food(String name, int calories) {
        this.name = name;
        this.calories = calories;
    }

    @Override
    public String toString() {
        return "Food{name='" + name + "', calories=" + calories + "}";
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Bienvenido al sistema de búsqueda de alimentos.");
        System.out.println("Ingrese el nombre del alimento que desea buscar:");
        String foodName = sc.nextLine();
        try {
            String key = "B3yQxo791LDmqc3scyEY8ru2kHJabUC661InCwXg";

            String endpoint = "https://api.nal.usda.gov/fdc/v1/foods/search?query="+foodName+"&api_key=" + key;

            // Abrir conexión
            URL url = new URL(endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            // Pedimos JSON como respuesta
            conn.setRequestProperty("Accept", "application/json");

            // Leer respuesta
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();

            // Mostrar JSON crudo
            System.out.println("Respuesta JSON:");
            System.out.println(content.toString());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
