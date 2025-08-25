import java.io.BufferedReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URL;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws IOException {
        Scanner in = new Scanner(System.in);
        System.out.println("¿Que alimento deseas buscar? (En ingles)");
        String alimento = in.nextLine();
        // Apy key de la API de USDA
        String apiKey = "B3yQxo791LDmqc3scyEY8ru2kHJabUC661InCwXg";
        if (apiKey == null) {
            throw new RuntimeException("No se encontró la API key. Configúrala en USDA_API_KEY.");
        }

        // Apertura de conexión
        String urlString = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + alimento +
                "&api_key=" + apiKey;
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        // Configuración de la solicitud
        connection.setRequestMethod("GET");

        BufferedReader reader = new BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        // Leer respuesta
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        // Cerrar lector
        reader.close();
        // Imprimir respuesta
        System.out.println(response.toString());


    }
}
