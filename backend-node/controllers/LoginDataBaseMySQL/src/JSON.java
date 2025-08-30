import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class JSON {
    public static JSONArray exportToJSON(Connection connection) throws SQLException {
        // Consulta SQL para obtener los datos de la tabla
        String sql = "SELECT * FROM user";
        JSONArray jsonArray = new JSONArray();
        try {
            // Crear una declaración y ejecutar la consulta
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // Iterar a través del conjunto de resultados y construir el JSONArray
            while (resultSet.next()){
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("id", resultSet.getInt("id"));
                jsonObject.put("name", resultSet.getString("name"));
                jsonObject.put("email", resultSet.getString("email"));
                jsonObject.put("password", resultSet.getString("password"));
                jsonObject.put("height", resultSet.getString("height"));
                jsonObject.put("weight", resultSet.getString("weight"));
                jsonObject.put("age", resultSet.getInt("age"));
                // Agregar el objeto JSON al array JSON
                jsonArray.put(jsonObject);
            }
        }


        catch (Exception e) {
            e.printStackTrace();

        }
        // Devolver el JSONArray resultante
        return jsonArray;
    }
}
