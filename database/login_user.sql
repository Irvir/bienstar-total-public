-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: login
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Martin','m@gmail.com','$2b$10$gdO5kIvomyQ1MGTpLeIxeO.9ufjCvR6i98H3Gy3CP4.gcjSmW4hv6',1,1,1),(2,'Pepe','pepe123@gmail.com','$2b$10$Dj9UT7oOn0HVOwr06ITgEO3hyYzpTMUp2jpQzjf/QJbvhdWO4.72C',9,1,18233),(3,'Pepe','mm1@gmail.com','$2b$10$asp0je3cuNqv1XC4XcGBYet8SbqSjGI1jnCfsfl5AWsxRYkMR4Rxq',30,30,12),(4,'Paulo','paulo1@gmail.com','$2b$10$7kMQBiptAhHVv2SPv12n6uS4o6Syd3LSbtu/AfeDNFxwbjooK5yna',172,72,21),(5,'Paulo','paulo2@gmail.com','$2b$10$7BrWPZCKZTPhqGLwHjdmUOceQFPvQZhgWTLReH6Rg57Hu86Z4RICi',172,72.1,21),(6,'Martin','m2@gmail.com','$2b$10$3iezPheE3mXYKa85zu9Ux..7CHInP6eYGN9Pkujg7VMMXNDDTl5mu',165,90.32,19),(7,'Jijija','j1@gmail.com','$2b$10$3wLwKTwgrODAQwJ7dA19F.Wdloqknh1ylxy82Ddf9QPinyWsKurpC',81,31,39),(8,'aa','m3@gmail.com','$2b$10$V4X9Ejy3om74hfvTgcmhTeh0ci8BQWoUV6K9zGZPnKELD1jR4V2Tm',150,40,31),(9,'aaa','m4@gmail.com','$2b$10$QEWQyBz7WY40VM3vHVBEW.2yDUsdi5.iZNYy8P14sRDu0.L95xm5q',180,40,31),(10,'aaaa','m5@gmail.com','$2b$10$KQGbOA74oTozyHZpFKqmM.DR7eZoRF4Va90idsUBVBUeLbBFP6zca',172,80,31),(11,'ae','m6@gmail.com','$2b$10$nkqqfQUm9qpZHcrxL8dBKOZ3D5/XcQ2LxR8B.nB4vms5f.HvcuNlu',151,60,32);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-19 15:51:48
