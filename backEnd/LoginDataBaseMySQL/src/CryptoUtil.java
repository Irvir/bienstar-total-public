import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.util.Base64;

public class CryptoUtil {
    // Genera clave secreta
    public static SecretKey generateKey() throws Exception {
        // AES es un estándar de cifrado avanzado
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(128); // 128 bits
        return keyGen.generateKey();
    }

    // Encriptar texto
    public static String encrypt(String data, SecretKey key) throws Exception {
        // Cipher es la clase que proporciona funcionalidad de cifrado y descifrado
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        // enc es el texto encriptado en bytes
        byte[] enc = cipher.doFinal(data.getBytes());
        // Convertir a Base64 para que sea legible
        return Base64.getEncoder().encodeToString(enc);
    }

    // Desencriptar texto
    public static String decrypt(String encryptedData, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] dec = Base64.getDecoder().decode(encryptedData);
        return new String(cipher.doFinal(dec));
    }
}
