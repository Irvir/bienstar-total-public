//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.

import org.json.JSONArray;

import javax.crypto.SecretKey;
import java.io.IO;
import java.io.IOException;
import java.sql.*;

public class Main {
    public static int getMinId(Connection connection) {
        String sql = "SELECT MIN(id) FROM user";

        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {

            if (resultSet.next()) {
                return resultSet.getInt(1); // Primera columna del resultado
            } else {
                throw new RuntimeException("No se pudo obtener el valor mínimo de ID");
            }

        } catch (SQLException e) {
            System.out.println("Error SQL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
    public static int getMaxId(Connection connection) {
        String sql = "SELECT MAX(id) FROM user";

        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {

            if (resultSet.next()) {
                return resultSet.getInt(1); // Primera columna del resultado
            } else {
                throw new RuntimeException("No se pudo obtener el valor máximo de ID");
            }

        } catch (SQLException e) {
            System.out.println("Error SQL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
    public static void updateUser(Connection conn, int id, String name, String password, String email, float height, float weight, int age) {
        String sql = "UPDATE user SET name = ?, password = ?, email = ?, height = ?, weight = ?, age = ? WHERE id = ?";

        try (PreparedStatement preparedStatement = conn.prepareStatement(sql)) {
            preparedStatement.setString(1, name);
            preparedStatement.setString(2, password);
            preparedStatement.setString(3, email);
            preparedStatement.setFloat(4, height);
            preparedStatement.setFloat(5, weight);
            preparedStatement.setInt(6, age);
            preparedStatement.setInt(7, id);

            int result = preparedStatement.executeUpdate();

            if (result == 1) {
                System.out.println("Usuario actualizado correctamente");
            } else {
                System.out.println("Error al actualizar usuario");
            }

        } catch (SQLException e) {
            System.out.println("Error SQL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
    public static void deleteUser(Connection conn, int id) {
        String sql = "DELETE FROM user WHERE id = ?";

        try (PreparedStatement preparedStatement = conn.prepareStatement(sql)) {
            preparedStatement.setInt(1, id);

            int result = preparedStatement.executeUpdate();

            if (result == 1) {
                System.out.println("Usuario eliminado correctamente");
            } else {
                System.out.println("Error al eliminar usuario");
            }

        } catch (SQLException e) {
            System.out.println("Error SQL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
    public static void insertUser(Connection connection, String name, String password, String email, float height, float weight, int age) {
        String sql = "INSERT INTO user(name, password, email, height, weight, age) VALUES (?, ?, ?, ?, ?, ?)";

        try (PreparedStatement preparedStatement = connection.prepareStatement(sql)) {
            preparedStatement.setString(1, name);
            preparedStatement.setString(2, password);
            preparedStatement.setString(3, email);
            preparedStatement.setFloat(4, height);
            preparedStatement.setFloat(5, weight);
            preparedStatement.setInt(6, age);

            int result = preparedStatement.executeUpdate();

            if (result == 1) {
                System.out.println("Usuario insertado correctamente");
            } else {
                System.out.println("Error al insertar usuario");
            }

        } catch (SQLException e) {
            System.out.println("Error SQL: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static void Consulta(Connection connection){
        String sql = "select * from user";
        Statement statement = null;
        ResultSet resultSet = null;
        String name;
        String password;
        String email;
        float height;
        float weight;
        int age;
        int id;

        try {
            statement= connection.createStatement();
            resultSet = statement.executeQuery(sql);
            while(resultSet.next()){
                name = resultSet.getString("name");
                password = resultSet.getString("password");
                email = resultSet.getString("email");
                height = resultSet.getFloat("height");
                weight = resultSet.getFloat("weight");
                age = resultSet.getInt("age");
                id = resultSet.getInt("id");
                System.out.println(id+" "+name + " " + password + " " + email + " " + height + " " + weight + " " + age);

            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static Connection conectarDB(String nameDB)  {
        Connection conexion;
        String host = "jdbc:mysql://localhost/";
        String user = "root";
        //Contrasena de la instalacion local de MySQL, cambiar si es necesario
        String pass = "Mar.23012006t";
        String bd = "login";
        try {
            conexion = DriverManager.getConnection(host + bd, user, pass);

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Conexión exitosa a la base de datos");

        return conexion;

    }
    public static void main(String[] args) throws Exception {
        //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
        // to see how IntelliJ IDEA suggests fixing it.

        Connection db = conectarDB("user");
        updateUser(db,3, "usuarioPruebazzz", "contraseñaPrueba", "emailPrueba", 1.75f, 70.0f, 25);
        Consulta(db);
        int minId = getMinId(db);
        int maxId = getMaxId(db);
        System.out.println(minId);
        System.out.println(maxId);

        //Exportar datos a formato JSON
        JSONArray jsonArray = JSON.exportToJSON(db);
        String jsonString = jsonArray.toString();
        System.out.println(jsonString);

        //Generar clave secreta y encriptar datos JSON
        SecretKey key = CryptoUtil.generateKey();
        String encryptedData = CryptoUtil.encrypt(jsonString, key);

        //Desencriptar datos JSON
        String decryptedJson = CryptoUtil.decrypt(encryptedData, key);
        JSONArray usersArray = new JSONArray(decryptedJson);

        //Imprimir datos de usuarios desencriptados
        System.out.println("Usuarios desencriptados:");
        for (int i = 0; i < usersArray.length(); i++) {
            org.json.JSONObject user = usersArray.getJSONObject(i);
            //Aqui poner formato a la impresion
            System.out.println(user.getString("name") + " - " + user.getInt("id"));
        }




    }
}