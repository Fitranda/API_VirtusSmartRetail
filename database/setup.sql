/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 8.0.30 : Database - virtusmartretail
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`virtusmartretail` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `virtusmartretail`;

/*Table structure for table `absensi` */

DROP TABLE IF EXISTS `absensi`;

CREATE TABLE `absensi` (
  `id_absensi` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_karyawan` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `jam_masuk` time NOT NULL,
  `jam_keluar` time NOT NULL,
  `status_hadir` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_absensi`),
  KEY `absensi_id_karyawan_foreign` (`id_karyawan`),
  CONSTRAINT `absensi_id_karyawan_foreign` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawan` (`id_karyawan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `absensi` */

LOCK TABLES `absensi` WRITE;

UNLOCK TABLES;

/*Table structure for table `akun` */

DROP TABLE IF EXISTS `akun`;

CREATE TABLE `akun` (
  `id_akun` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_akun` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('Asset','Kewajiban','Ekuitas','Pendapatan','Beban') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_akun`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `akun` */

LOCK TABLES `akun` WRITE;

insert  into `akun`(`id_akun`,`nama_akun`,`tipe`,`created_at`,`updated_at`) values 
(1,'Kas','Asset','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,'Bank','Asset','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,'Piutang Usaha','Asset','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,'Persediaan','Asset','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,'Perlengkapan Kantor','Asset','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,'Hutang Usaha','Kewajiban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,'Hutang Bank','Kewajiban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,'Pendapatan Diterima di Muka','Kewajiban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,'Modal Pemilik','Ekuitas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,'Laba Ditahan','Ekuitas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,'Pendapatan Penjualan','Pendapatan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,'Pendapatan Lain-lain','Pendapatan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,'Beban Gaji','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,'Beban Sewa','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,'Beban Listrik dan Air','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,'Beban Transportasi','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,'Beban Penyusutan','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,'Pendapatan Bunga','Pendapatan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,'Pendapatan Dividen','Pendapatan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,'Beban Asuransi','Beban','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `cache` */

DROP TABLE IF EXISTS `cache`;

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `cache` */

LOCK TABLES `cache` WRITE;

UNLOCK TABLES;

/*Table structure for table `cache_locks` */

DROP TABLE IF EXISTS `cache_locks`;

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `cache_locks` */

LOCK TABLES `cache_locks` WRITE;

UNLOCK TABLES;

/*Table structure for table `detail_penjualan` */

DROP TABLE IF EXISTS `detail_penjualan`;

CREATE TABLE `detail_penjualan` (
  `id_detail` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_penjualan` bigint unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `jumlah` int NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_detail`),
  KEY `detail_penjualan_id_penjualan_foreign` (`id_penjualan`),
  KEY `detail_penjualan_id_produk_foreign` (`id_produk`),
  CONSTRAINT `detail_penjualan_id_penjualan_foreign` FOREIGN KEY (`id_penjualan`) REFERENCES `transaksi_penjualan` (`id_penjualan`),
  CONSTRAINT `detail_penjualan_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `detail_penjualan` */

LOCK TABLES `detail_penjualan` WRITE;

insert  into `detail_penjualan`(`id_detail`,`id_penjualan`,`id_produk`,`jumlah`,`harga_satuan`,`created_at`,`updated_at`) values 
(1,5,7,10,87690.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,15,10,5,38323.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,11,3,1,79867.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,17,15,3,68846.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,15,1,5,68435.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,9,2,3,26476.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,16,12,2,54507.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,4,17,1,31385.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,3,16,9,60316.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,20,1,1,14147.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,8,6,5,19214.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,13,8,6,86509.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,20,1,7,97675.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,7,10,6,23630.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,2,9,8,88935.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,9,17,5,88795.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,3,9,7,15078.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,16,8,2,71355.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,11,18,10,73285.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,17,4,3,90368.00,'2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `failed_jobs` */

DROP TABLE IF EXISTS `failed_jobs`;

CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `failed_jobs` */

LOCK TABLES `failed_jobs` WRITE;

UNLOCK TABLES;

/*Table structure for table `hutang` */

DROP TABLE IF EXISTS `hutang`;

CREATE TABLE `hutang` (
  `id_hutang` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_supplier` bigint unsigned NOT NULL,
  `tanggal_hutang` date NOT NULL,
  `jumlah_hutang` decimal(10,2) NOT NULL,
  `status` enum('Lunas','Belum Lunas') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_hutang`),
  KEY `hutang_id_supplier_foreign` (`id_supplier`),
  CONSTRAINT `hutang_id_supplier_foreign` FOREIGN KEY (`id_supplier`) REFERENCES `supplier` (`id_supplier`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `hutang` */

LOCK TABLES `hutang` WRITE;

insert  into `hutang`(`id_hutang`,`id_supplier`,`tanggal_hutang`,`jumlah_hutang`,`status`,`created_at`,`updated_at`) values 
(1,18,'1991-09-21',779143.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,6,'2005-01-06',287038.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,14,'2025-05-24',267090.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,12,'1975-02-05',621471.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,13,'1992-01-25',537376.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,1,'1979-05-29',142689.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,13,'1998-02-20',547365.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,4,'1996-08-28',274529.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,5,'1993-08-30',421401.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,3,'1982-02-26',547919.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,16,'2005-11-13',958408.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,10,'2024-11-23',463863.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,6,'2000-06-23',179521.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,1,'1971-05-02',791382.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,14,'1994-03-08',108192.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,16,'1999-10-10',600314.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,5,'1988-01-29',512970.00,'Belum Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,18,'1982-08-14',840590.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,3,'1979-11-05',863609.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,2,'1984-11-04',968804.00,'Lunas','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `jadwal` */

DROP TABLE IF EXISTS `jadwal`;

CREATE TABLE `jadwal` (
  `id_jadwal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_karyawan` bigint unsigned NOT NULL,
  `id_shift` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jadwal`),
  KEY `jadwal_id_karyawan_foreign` (`id_karyawan`),
  KEY `jadwal_id_shift_foreign` (`id_shift`),
  CONSTRAINT `jadwal_id_karyawan_foreign` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawan` (`id_karyawan`),
  CONSTRAINT `jadwal_id_shift_foreign` FOREIGN KEY (`id_shift`) REFERENCES `shifts` (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `jadwal` */

LOCK TABLES `jadwal` WRITE;

insert  into `jadwal`(`id_jadwal`,`id_karyawan`,`id_shift`,`tanggal`,`created_at`,`updated_at`) values 
(1,1,3,'1993-11-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,1,1,'2014-10-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,1,1,'1991-10-02','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,1,3,'1990-05-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,1,2,'1989-05-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,2,1,'1995-06-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,2,2,'2018-03-12','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,2,1,'1987-05-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,2,3,'1990-08-17','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,2,3,'1976-06-13','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,3,3,'1984-10-23','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,3,1,'1970-02-06','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,3,2,'1975-08-23','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,3,1,'2015-05-13','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,3,1,'1998-03-03','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,4,2,'2018-03-06','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,4,2,'2014-02-17','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,4,1,'2007-06-21','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,4,2,'2021-07-06','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,4,1,'2017-03-21','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(21,5,2,'2019-02-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(22,5,1,'2003-06-01','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(23,5,2,'1994-11-02','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(24,5,1,'2019-04-02','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(25,5,3,'1991-02-24','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(26,6,1,'2025-05-26','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(27,6,2,'2002-05-11','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(28,6,2,'1987-09-20','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(29,6,1,'1979-07-01','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(30,6,1,'1975-12-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(31,7,3,'2002-06-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(32,7,2,'2014-06-09','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(33,7,1,'2013-09-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(34,7,2,'1975-11-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(35,7,3,'2006-07-14','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(36,8,3,'2015-05-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(37,8,2,'1997-07-12','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(38,8,3,'1980-03-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(39,8,3,'1995-05-13','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(40,8,2,'1994-12-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(41,9,1,'2014-02-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(42,9,3,'2010-12-20','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(43,9,1,'1989-06-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(44,9,1,'2002-03-01','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(45,9,2,'1982-06-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(46,10,2,'1977-08-20','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(47,10,1,'1972-12-17','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(48,10,1,'1992-12-17','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(49,10,2,'2018-08-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(50,10,1,'2017-12-27','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(51,11,2,'2023-11-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(52,11,1,'1982-01-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(53,11,1,'2003-06-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(54,11,2,'1980-11-24','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(55,11,1,'2003-04-30','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(56,12,1,'2021-01-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(57,12,1,'1976-06-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(58,12,3,'1975-10-01','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(59,12,3,'2006-08-26','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(60,12,2,'1991-06-23','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(61,13,1,'2010-05-11','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(62,13,2,'2018-07-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(63,13,1,'1992-07-31','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(64,13,1,'2012-04-04','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(65,13,2,'2014-03-11','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(66,14,1,'1991-10-20','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(67,14,2,'1997-03-09','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(68,14,1,'2024-09-11','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(69,14,3,'2019-06-09','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(70,14,3,'1982-08-23','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(71,15,2,'2024-07-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(72,15,1,'2008-03-20','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(73,15,2,'2000-07-19','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(74,15,1,'2024-07-03','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(75,15,3,'2019-04-13','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(76,16,1,'1981-04-08','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(77,16,1,'2013-01-31','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(78,16,2,'2012-03-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(79,16,2,'1992-09-05','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(80,16,2,'1979-12-16','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(81,17,2,'2000-05-26','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(82,17,3,'1981-10-19','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(83,17,2,'1993-01-13','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(84,17,3,'1986-01-02','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(85,17,1,'1999-05-23','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(86,18,2,'2005-09-21','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(87,18,1,'2006-05-25','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(88,18,1,'2010-10-11','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(89,18,3,'2012-04-07','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(90,18,3,'1979-12-24','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(91,19,3,'2013-01-15','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(92,19,2,'1995-08-29','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(93,19,2,'1981-04-22','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(94,19,1,'2014-08-01','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(95,19,2,'1977-09-09','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(96,20,1,'2000-03-18','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(97,20,2,'1980-02-03','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(98,20,2,'1975-10-04','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(99,20,1,'1997-10-06','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(100,20,3,'1981-03-26','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `job_batches` */

DROP TABLE IF EXISTS `job_batches`;

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `job_batches` */

LOCK TABLES `job_batches` WRITE;

UNLOCK TABLES;

/*Table structure for table `jobs` */

DROP TABLE IF EXISTS `jobs`;

CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `jobs` */

LOCK TABLES `jobs` WRITE;

UNLOCK TABLES;

/*Table structure for table `jurnal` */

DROP TABLE IF EXISTS `jurnal`;

CREATE TABLE `jurnal` (
  `id_jurnal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_akun` bigint unsigned NOT NULL,
  `tanggal_jurnal` date NOT NULL,
  `debet` decimal(10,2) NOT NULL,
  `kredit` decimal(10,2) NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_jurnal`),
  KEY `jurnal_id_akun_foreign` (`id_akun`),
  CONSTRAINT `jurnal_id_akun_foreign` FOREIGN KEY (`id_akun`) REFERENCES `akun` (`id_akun`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `jurnal` */

LOCK TABLES `jurnal` WRITE;

insert  into `jurnal`(`id_jurnal`,`id_akun`,`tanggal_jurnal`,`debet`,`kredit`,`keterangan`,`created_at`,`updated_at`) values 
(1,4,'2024-12-01',50000.00,0.00,'Pembelian Persediaan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,6,'2024-12-01',0.00,50000.00,'Pembelian secara kredit','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,4,'2024-12-02',80000.00,0.00,'Pembelian Persediaan tambahan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,6,'2024-12-02',0.00,80000.00,'Pembelian tambahan secara kredit','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,4,'2024-12-03',60000.00,0.00,'Pembelian barang dagang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,6,'2024-12-03',0.00,60000.00,'Pembelian barang dagang secara kredit','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,3,'2024-12-04',100000.00,0.00,'Piutang atas penjualan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,11,'2024-12-04',0.00,100000.00,'Pendapatan dari penjualan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,3,'2024-12-05',120000.00,0.00,'Penjualan secara piutang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,11,'2024-12-05',0.00,120000.00,'Pendapatan dari penjualan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,1,'2024-12-06',50000.00,0.00,'Kas diterima dari penjualan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,11,'2024-12-06',0.00,50000.00,'Pendapatan dari penjualan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,3,'2024-12-07',75000.00,0.00,'Penjualan kredit kepada pelanggan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,11,'2024-12-07',0.00,75000.00,'Pendapatan penjualan kredit','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,3,'2024-12-08',110000.00,0.00,'Penjualan kredit lainnya','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,11,'2024-12-08',0.00,110000.00,'Pendapatan penjualan tambahan','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,1,'2024-12-09',90000.00,0.00,'Kas masuk dari hasil usaha','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,2,'2024-12-10',70000.00,0.00,'Dana disimpan ke bank','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,5,'2024-12-11',30000.00,0.00,'Pembelian perlengkapan kantor','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,1,'2024-12-12',45000.00,0.00,'Kas tambahan dari investor','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(21,5,'2024-12-13',50000.00,0.00,'Pengadaan aset tetap','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `karyawan` */

DROP TABLE IF EXISTS `karyawan`;

CREATE TABLE `karyawan` (
  `id_karyawan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posisi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gaji_pokok` decimal(10,2) NOT NULL,
  `id_shift` bigint unsigned NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_role` bigint unsigned NOT NULL,
  `status` enum('aktif','nonaktif') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_karyawan`),
  UNIQUE KEY `karyawan_username_unique` (`username`),
  UNIQUE KEY `karyawan_email_unique` (`email`),
  KEY `karyawan_id_shift_foreign` (`id_shift`),
  KEY `karyawan_id_role_foreign` (`id_role`),
  CONSTRAINT `karyawan_id_role_foreign` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`),
  CONSTRAINT `karyawan_id_shift_foreign` FOREIGN KEY (`id_shift`) REFERENCES `shifts` (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `karyawan` */

LOCK TABLES `karyawan` WRITE;

insert  into `karyawan`(`id_karyawan`,`nama`,`posisi`,`gaji_pokok`,`id_shift`,`username`,`password`,`email`,`remember_token`,`id_role`,`status`,`created_at`,`updated_at`) values 
(1,'Budi Santoso','Manager',7500000.00,2,'budi.santoso','$2y$12$ygABsDc1oCgnOcEnZ.nl7exIdr7.SvBS4cP.SW6LEDKMbIwaN8IkC','budi.santoso@gmail.com','zSnD9p6cmX',1,'aktif','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(2,'Siti Nurhaliza','Admin',4500000.00,1,'siti.nurhaliza','$2y$12$dafUncX7qHNBIWv/4zO3qeQQXdJwnKqs9CqKXm.AYuzOuecJDSgx.','siti.nurhaliza@gmail.com','R3Dxs1cBBg',2,'aktif','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(3,'Andi Pratama','Staff IT',6000000.00,1,'andi.pratama','$2y$12$2aKx35Vj7ptOZdSINitQ4euPeF4dd6zgCrwNx886OOEoxCAWPzU72','andi.pratama@gmail.com','xR5u8bWdzw',3,'aktif','2025-05-30 09:03:48','2025-05-30 09:03:48'),
(4,'Dewi Sartika','HRD',7000000.00,1,'dewi.sartika','$2y$12$Ob9Se.SqgG7UekiJ3XJzROdTEA1BZeVr/vKu3y18eopo..Ok7kmQe','dewi.sartika@gmail.com','NcSFWYRFMm',4,'aktif','2025-05-30 09:03:48','2025-05-30 09:03:48'),
(5,'Rizki Hidayat','Marketing',5500000.00,2,'rizki.hidayat','$2y$12$7e7vOxK4Aef/K4uHSDBPE.qSgDI/btyw8lq2WswZrqIwhYyhuZMxW','rizki.hidayat@gmail.com','BmzerTNzHK',5,'nonaktif','2025-05-30 09:03:48','2025-05-30 09:03:48'),
(6,'Nurul Fadilah','Finance',6500000.00,3,'nurul.fadilah','$2y$12$USZZ8/jMYKyEhp8CRL1cnuHH3HCbh2ShnZ7PL0sKNUUXSrNokCuIu','nurul.fadilah@gmail.com','bqo32sCez6',2,'aktif','2025-05-30 09:03:49','2025-05-30 09:03:49'),
(7,'Adi Wibowo','Staff Operasional',4000000.00,2,'adi.wibowo','$2y$12$1eZTFic4ehS2fnCbCp9Ch.MLDjAiuis2LsFU0zUe4zoWM1tTXu5AW','adi.wibowo@gmail.com','XfAMhYV31K',3,'nonaktif','2025-05-30 09:03:49','2025-05-30 09:03:49'),
(8,'Lestari Handayani','Supervisor',8000000.00,2,'lestari.handayani','$2y$12$rLOEdHEy0o47uRKaEtz6Gu0X2hD0KcPjDCp.Iq/qxkyJSDdNTZ4uq','lestari.handayani@gmail.com','BfiPrtCJpM',1,'aktif','2025-05-30 09:03:50','2025-05-30 09:03:50'),
(9,'Farid Maulana','IT Support',5000000.00,3,'farid.maulana','$2y$12$yTLao35mWBOac24.Nr9GbOfhBRlzsAsPXUkuJn8xA08VFyJ.icRTm','farid.maulana@gmail.com','IVX8LfPqNV',3,'nonaktif','2025-05-30 09:03:50','2025-05-30 09:03:50'),
(10,'Yulianti Pramesti','Admin',4500000.00,3,'yulianti.pramesti','$2y$12$FksWd8rETte9ATnvkRPlfucpOIiO8qqo9g404g8YInuhJC6fNZzqm','yulianti.pramesti@gmail.com','p7EuaRMcQJ',2,'aktif','2025-05-30 09:03:50','2025-05-30 09:03:50'),
(11,'Hendra Gunawan','Manager Operasional',8500000.00,1,'hendra.gunawan','$2y$12$gUHVzKFNglKIAqpBQIfZcO4eR4uKqA/bdbzgYTkLVx0ZGOSi2cY6q','hendra.gunawan@gmail.com','CP7KsaqXey',1,'aktif','2025-05-30 09:03:51','2025-05-30 09:03:51'),
(12,'Linda Kusuma','Supervisor Marketing',7500000.00,3,'linda.kusuma','$2y$12$0vKGElTcex.72Vu3U.Zv2.bTBMCRxhtqM0mZISu6Z45j9wUQWsofa','linda.kusuma@gmail.com','LHva2803Au',5,'aktif','2025-05-30 09:03:51','2025-05-30 09:03:51'),
(13,'Agus Prasetyo','Keuangan',6000000.00,3,'agus.prasetyo','$2y$12$/wZjz7IPG7ldBcmEC5RgdecfAWN.LD8TfsD8qIGn902pZR1zarqZ6','agus.prasetyo@gmail.com','g8Mq6BeEis',2,'nonaktif','2025-05-30 09:03:52','2025-05-30 09:03:52'),
(14,'Rani Wijaya','HR',7000000.00,2,'rani.wijaya','$2y$12$YH69TcYUbORKYQ90C.32iukYQIeL9pk84ygla/eGNxmCpjT4zliFW','rani.wijaya@gmail.com','ATEMZecpeY',4,'aktif','2025-05-30 09:03:52','2025-05-30 09:03:52'),
(15,'Dwi Anggoro','Marketing',5000000.00,1,'dwi.anggoro','$2y$12$MFR7yx/n14h3xozyOBj2keITLZWmFMfiYoyzC2Yt58pQ/tqDr/fbe','dwi.anggoro@gmail.com','hYQ7qgwp0c',5,'aktif','2025-05-30 09:03:52','2025-05-30 09:03:52'),
(16,'Sri Lestari','Admin',4000000.00,2,'sri.lestari','$2y$12$3ICacEwnITEKr01OGuMMSeswkGGLviZ4urH9C7Kyz5Nf2QOJg12lm','sri.lestari@gmail.com','iWnmTTmHuY',2,'aktif','2025-05-30 09:03:53','2025-05-30 09:03:53'),
(17,'Fikri Abdullah','Supervisor IT',7500000.00,3,'fikri.abdullah','$2y$12$1/GbcBanF3H1qim4MNZ3Ou3XXcLM2XiVT0lMHznH3.XMnidosyxn.','fikri.abdullah@gmail.com','44sq0sCrG3',3,'nonaktif','2025-05-30 09:03:53','2025-05-30 09:03:53'),
(18,'Vina Maharani','Finance',5000000.00,1,'vina.maharani','$2y$12$9sRfQjYbGbIm5NCuIiIDne/amvsRPgjGsfpNtI1V5C3FrGnWQS0/m','vina.maharani@gmail.com','DpUA4niNgD',2,'aktif','2025-05-30 09:03:54','2025-05-30 09:03:54'),
(19,'Teguh Saputra','Manager',9000000.00,1,'teguh.saputra','$2y$12$z0ESfuTukRtPhws6B44X9uIL9GgQB0LguN8oA3vXfaDm5Ef5F1vpO','teguh.saputra@gmail.com','2PZAbHIVAU',1,'aktif','2025-05-30 09:03:54','2025-05-30 09:03:54'),
(20,'Rina Andayani','Admin',4000000.00,1,'rina.andayani','$2y$12$LYVMRjk5lcCIDuYk.Petn.JSXuM1Ep50gaBOcIo/9th.flbIYFDA2','rina.andayani@gmail.com','2pL5XTGo8o',2,'aktif','2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `manage_absensis` */

DROP TABLE IF EXISTS `manage_absensis`;

CREATE TABLE `manage_absensis` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_karyawan` bigint unsigned NOT NULL,
  `id_shift` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `status_hadir` enum('Hadir','Tidak Hadir') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manage_absensis_id_karyawan_foreign` (`id_karyawan`),
  KEY `manage_absensis_id_shift_foreign` (`id_shift`),
  CONSTRAINT `manage_absensis_id_karyawan_foreign` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawan` (`id_karyawan`) ON DELETE CASCADE,
  CONSTRAINT `manage_absensis_id_shift_foreign` FOREIGN KEY (`id_shift`) REFERENCES `shifts` (`id_shift`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `manage_absensis` */

LOCK TABLES `manage_absensis` WRITE;

UNLOCK TABLES;

/*Table structure for table `migrations` */

DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `migrations` */

LOCK TABLES `migrations` WRITE;

insert  into `migrations`(`id`,`migration`,`batch`) values 
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2024_11_03_023217_create_roles_table',1),
(5,'2024_11_03_024817_create_shifts_table',1),
(6,'2024_11_03_024819_create_karyawans_table',1),
(7,'2024_11_03_024820_create_absensis_table',1),
(8,'2024_11_03_025707_create_produks_table',1),
(9,'2024_11_03_035705_create_pelanggans_table',1),
(10,'2024_11_03_035705_create_transaksi_penjualans_table',1),
(11,'2024_11_03_035706_create_detail_penjualans_table',1),
(12,'2024_11_03_035707_create_suppliers_table',1),
(13,'2024_11_03_035708_create_purchase_orders_table',1),
(14,'2024_11_03_035708_create_stokopnames_table',1),
(15,'2024_11_03_035709_create_purchase_order_items_table',1),
(16,'2024_11_03_035710_create_pembayarans_table',1),
(17,'2024_11_03_035710_create_penerimaan_barangs_table',1),
(18,'2024_11_03_035711_create_penerimaan_barang_items_table',1),
(19,'2024_11_03_035711_create_retur_barangs_table',1),
(20,'2024_11_03_035712_create_retur_barang_items_table',1),
(21,'2024_11_03_035713_create_akuns_table',1),
(22,'2024_11_03_035713_create_pengembalian_barang_ke_suppliers_table',1),
(23,'2024_11_03_035714_create_jurnals_table',1),
(24,'2024_11_03_035720_create_hutangs_table',1),
(25,'2024_11_10_091110_create_jadwal_table',1),
(26,'2024_12_14_083311_create_stok_request_table',1),
(27,'2024_12_14_083314_create_pembelian_table',1),
(28,'2024_12_18_123551_create_manage_absensis_table',1),
(29,'2024_12_18_214511_create_penggajian_table',1);

UNLOCK TABLES;

/*Table structure for table `password_reset_tokens` */

DROP TABLE IF EXISTS `password_reset_tokens`;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `password_reset_tokens` */

LOCK TABLES `password_reset_tokens` WRITE;

UNLOCK TABLES;

/*Table structure for table `pelanggan` */

DROP TABLE IF EXISTS `pelanggan`;

CREATE TABLE `pelanggan` (
  `id_pelanggan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_pelanggan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kontak` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pelanggan`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `pelanggan` */

LOCK TABLES `pelanggan` WRITE;

insert  into `pelanggan`(`id_pelanggan`,`nama_pelanggan`,`kontak`,`alamat`,`created_at`,`updated_at`) values 
(1,'Haylee Miller','938-979-7613','2200 Kling Station Suite 382\nNorth Jeff, AR 92407-9575','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,'Lambert Strosin','(636) 292-0408','640 Gilberto Meadow\nLebsackport, KS 05064-0573','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,'Janis McKenzie','(781) 354-0359','815 Von Track Suite 097\nStiedemannmouth, ND 30333','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,'Billy Williamson I','+1-234-978-6081','81181 Turner Garden Apt. 341\nStreichport, AR 33962-3630','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,'Miss Jaunita Simonis','+1-520-980-2751','11320 Davonte Hill Suite 182\nFloyburgh, MO 00119-4979','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,'Dr. Tyrique Kreiger','+1-248-530-1470','523 Crooks Mews Apt. 907\nFaymouth, AR 86517-2721','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,'Miss Elouise Hill','510-519-6996','126 Gislason Springs\nLake Avisstad, UT 65790-0322','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,'Mr. Jaycee Ankunding I','352-657-1466','5846 Veum Port\nWest Leonoraville, GA 83768-3933','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,'Dr. Damon Brakus DVM','531.326.9035','77106 Tatyana Coves Suite 128\nKatelinmouth, AZ 77429','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,'Dolly Herzog','810.498.5601','4798 Ottis Street Suite 369\nPort Maximilianville, LA 46070','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,'Zelma Crooks','470.768.2089','6823 Orie Station Suite 438\nRomagueraburgh, SD 76128-0602','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,'Mrs. Marlee Sipes','1-507-421-7327','7952 Shields Plaza\nEugeniafurt, NJ 95809-4790','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,'Conor Medhurst','602-942-8461','356 Heathcote Lodge\nNew Roselyn, AL 05762','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,'Leora Kunze','1-414-232-0906','32038 Abbott Land\nColeburgh, NY 42948','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,'Kailee Hettinger','+1 (417) 747-5049','397 Gulgowski Lane Suite 016\nSouth Karley, CT 67107-3639','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,'Assunta Rolfson DVM','762-200-9935','421 Hintz Stream Apt. 910\nPort Estebanfort, LA 80658','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,'Adell Cronin','551.643.5678','40070 Rosenbaum Stravenue Apt. 925\nNorth Brennon, KY 35368','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,'Derrick Mante DVM','(743) 913-8325','27445 Schamberger Plains\nCarliview, IA 15215','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,'Tabitha Wisoky','256.736.6322','3229 Dare Ranch Suite 599\nRobertside, NC 26722-4492','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,'Mr. Kay Morissette MD','361-958-3569','9362 Aylin Court\nEast Sabrynaton, NJ 86815-4049','2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `pembayaran` */

DROP TABLE IF EXISTS `pembayaran`;

CREATE TABLE `pembayaran` (
  `id_pembayaran` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_po` bigint unsigned NOT NULL,
  `tanggal_pembayaran` date NOT NULL,
  `jumlah_dibayar` decimal(10,2) NOT NULL,
  `status_pembayaran` enum('pending','selesai') COLLATE utf8mb4_unicode_ci NOT NULL,
  `disetujui_oleh` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pembayaran`),
  KEY `pembayaran_id_po_foreign` (`id_po`),
  KEY `pembayaran_disetujui_oleh_foreign` (`disetujui_oleh`),
  CONSTRAINT `pembayaran_disetujui_oleh_foreign` FOREIGN KEY (`disetujui_oleh`) REFERENCES `karyawan` (`id_karyawan`),
  CONSTRAINT `pembayaran_id_po_foreign` FOREIGN KEY (`id_po`) REFERENCES `purchase_orders` (`id_po`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `pembayaran` */

LOCK TABLES `pembayaran` WRITE;

insert  into `pembayaran`(`id_pembayaran`,`id_po`,`tanggal_pembayaran`,`jumlah_dibayar`,`status_pembayaran`,`disetujui_oleh`,`created_at`,`updated_at`) values 
(1,2,'1999-02-17',360227.00,'pending',6,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,3,'1975-09-10',812154.00,'pending',4,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,2,'2011-11-19',855740.00,'pending',1,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,5,'2012-05-08',189121.00,'pending',7,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,10,'1976-11-28',193892.00,'pending',6,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,13,'2016-10-04',350143.00,'pending',9,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,5,'1978-09-05',872512.00,'selesai',1,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,19,'2021-07-12',390403.00,'pending',10,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,20,'2024-04-02',583703.00,'selesai',8,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,10,'2005-02-05',256017.00,'pending',10,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,12,'2023-02-28',710253.00,'selesai',4,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,16,'1972-01-30',905933.00,'pending',7,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,7,'1987-06-29',310124.00,'selesai',10,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,20,'2018-07-08',583875.00,'pending',2,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,6,'1999-10-14',616195.00,'pending',1,'2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,18,'2018-04-17',884322.00,'selesai',10,'2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,4,'2012-11-25',224702.00,'pending',5,'2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,13,'2017-06-20',569172.00,'selesai',2,'2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,15,'2022-02-09',968145.00,'pending',9,'2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,8,'1989-07-26',249045.00,'pending',6,'2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `pembelian` */

DROP TABLE IF EXISTS `pembelian`;

CREATE TABLE `pembelian` (
  `id_pembelian` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_supplier` bigint unsigned NOT NULL,
  `no_faktur` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` date NOT NULL,
  `total` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pembelian`),
  KEY `pembelian_id_supplier_foreign` (`id_supplier`),
  CONSTRAINT `pembelian_id_supplier_foreign` FOREIGN KEY (`id_supplier`) REFERENCES `supplier` (`id_supplier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `pembelian` */

LOCK TABLES `pembelian` WRITE;

UNLOCK TABLES;

/*Table structure for table `pembelian_detail` */

DROP TABLE IF EXISTS `pembelian_detail`;

CREATE TABLE `pembelian_detail` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pembelian` bigint unsigned NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `jumlah` int NOT NULL,
  `harga` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pembelian_detail_id_pembelian_foreign` (`id_pembelian`),
  KEY `pembelian_detail_id_produk_foreign` (`id_produk`),
  CONSTRAINT `pembelian_detail_id_pembelian_foreign` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian` (`id_pembelian`),
  CONSTRAINT `pembelian_detail_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `pembelian_detail` */

LOCK TABLES `pembelian_detail` WRITE;

UNLOCK TABLES;

/*Table structure for table `penerimaan_barang` */

DROP TABLE IF EXISTS `penerimaan_barang`;

CREATE TABLE `penerimaan_barang` (
  `id_penerimaan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_po` bigint unsigned NOT NULL,
  `tanggal_terima` date NOT NULL,
  `diterima_oleh` bigint unsigned NOT NULL,
  `status` enum('selesai','sebagian','rusak','pending') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_penerimaan`),
  KEY `penerimaan_barang_id_po_foreign` (`id_po`),
  KEY `penerimaan_barang_diterima_oleh_foreign` (`diterima_oleh`),
  CONSTRAINT `penerimaan_barang_diterima_oleh_foreign` FOREIGN KEY (`diterima_oleh`) REFERENCES `karyawan` (`id_karyawan`),
  CONSTRAINT `penerimaan_barang_id_po_foreign` FOREIGN KEY (`id_po`) REFERENCES `purchase_orders` (`id_po`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `penerimaan_barang` */

LOCK TABLES `penerimaan_barang` WRITE;

insert  into `penerimaan_barang`(`id_penerimaan`,`id_po`,`tanggal_terima`,`diterima_oleh`,`status`,`catatan`,`created_at`,`updated_at`) values 
(1,15,'2020-12-02',8,'rusak','Temporibus fuga eius qui et ea perferendis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,2,'2015-07-26',6,'rusak','Natus ipsa laudantium ea nostrum maxime non accusamus.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,17,'2006-12-06',3,'selesai','Ab adipisci porro ab ab.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,14,'1991-01-05',4,'sebagian','Voluptatem est autem eaque ex modi.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,2,'2016-08-21',8,'selesai','Repellat id maxime sit ut.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,2,'2004-10-29',10,'pending','Id et deleniti omnis itaque id consequatur molestias.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,3,'1980-07-16',7,'rusak','Minus occaecati sunt autem.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,17,'1999-06-28',6,'pending','Odio eius voluptas totam cum animi perspiciatis fugiat.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,1,'1998-03-14',1,'pending','Ea sunt nesciunt dolores eos et adipisci.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,7,'1987-09-23',6,'rusak','Aspernatur odit odit quasi et.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,16,'1972-04-13',5,'selesai','Aliquam illo quia commodi rem beatae animi maxime.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,3,'1976-12-22',5,'pending','Corrupti beatae aut rerum pariatur dolorem iusto.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,7,'2019-06-22',2,'selesai','Non enim minima voluptas rerum facere unde voluptatem quibusdam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,6,'2017-05-16',7,'pending','Et ut voluptatem voluptas et quia consequatur autem.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,10,'2016-04-16',5,'pending','Ducimus vel voluptate autem cum.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,16,'1979-05-02',2,'rusak','Ipsa sed aut quisquam sapiente quia quis unde.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,4,'2009-08-10',3,'pending','Commodi repellat animi rerum accusamus.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,17,'2007-06-30',3,'selesai','Unde maxime maxime eum et accusamus.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,4,'1975-10-10',3,'sebagian','Architecto culpa quod nesciunt sit id eos.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,9,'2019-04-13',8,'pending','Ut est facere et est sit voluptatem.','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `penerimaan_barang_items` */

DROP TABLE IF EXISTS `penerimaan_barang_items`;

CREATE TABLE `penerimaan_barang_items` (
  `id_item_penerimaan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_penerimaan` bigint unsigned NOT NULL,
  `id_item_po` bigint unsigned NOT NULL,
  `jumlah_diterima` int NOT NULL,
  `kondisi` enum('baik','rusak','hilang') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_item_penerimaan`),
  KEY `penerimaan_barang_items_id_penerimaan_foreign` (`id_penerimaan`),
  KEY `penerimaan_barang_items_id_item_po_foreign` (`id_item_po`),
  CONSTRAINT `penerimaan_barang_items_id_item_po_foreign` FOREIGN KEY (`id_item_po`) REFERENCES `purchase_order_items` (`id_item_po`),
  CONSTRAINT `penerimaan_barang_items_id_penerimaan_foreign` FOREIGN KEY (`id_penerimaan`) REFERENCES `penerimaan_barang` (`id_penerimaan`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `penerimaan_barang_items` */

LOCK TABLES `penerimaan_barang_items` WRITE;

insert  into `penerimaan_barang_items`(`id_item_penerimaan`,`id_penerimaan`,`id_item_po`,`jumlah_diterima`,`kondisi`,`created_at`,`updated_at`) values 
(1,6,3,71,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,10,11,23,'hilang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,18,11,52,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,16,14,91,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,8,11,34,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,11,4,34,'hilang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,19,13,79,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,18,12,68,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,17,7,43,'hilang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,10,20,22,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,20,11,11,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,16,3,67,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,17,3,49,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,2,18,3,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,2,1,81,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,10,19,82,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,15,18,2,'hilang','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,18,6,11,'rusak','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,17,12,93,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,19,10,69,'baik','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `pengembalian_barang_ke_supplier` */

DROP TABLE IF EXISTS `pengembalian_barang_ke_supplier`;

CREATE TABLE `pengembalian_barang_ke_supplier` (
  `id_pengembalian` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_retur` bigint unsigned NOT NULL,
  `tanggal_pengembalian` date NOT NULL,
  `dikirim_oleh` bigint unsigned NOT NULL,
  `status_pengiriman` enum('pending','dikirim','diterima_supplier') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pengembalian`),
  KEY `pengembalian_barang_ke_supplier_id_retur_foreign` (`id_retur`),
  KEY `pengembalian_barang_ke_supplier_dikirim_oleh_foreign` (`dikirim_oleh`),
  CONSTRAINT `pengembalian_barang_ke_supplier_dikirim_oleh_foreign` FOREIGN KEY (`dikirim_oleh`) REFERENCES `karyawan` (`id_karyawan`),
  CONSTRAINT `pengembalian_barang_ke_supplier_id_retur_foreign` FOREIGN KEY (`id_retur`) REFERENCES `retur_barang` (`id_retur`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `pengembalian_barang_ke_supplier` */

LOCK TABLES `pengembalian_barang_ke_supplier` WRITE;

insert  into `pengembalian_barang_ke_supplier`(`id_pengembalian`,`id_retur`,`tanggal_pengembalian`,`dikirim_oleh`,`status_pengiriman`,`catatan`,`created_at`,`updated_at`) values 
(1,9,'1975-11-17',6,'diterima_supplier','Placeat quam corporis placeat enim quam sunt maxime nam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,11,'2005-02-20',8,'dikirim','Dignissimos est eos officiis fugiat deleniti repellat quo asperiores.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,11,'1980-01-19',2,'pending','Cupiditate nemo nisi itaque tenetur autem molestiae eos asperiores.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,10,'2000-03-29',1,'diterima_supplier','Earum quisquam aut voluptatem dolores repellendus aliquam numquam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,5,'1992-08-13',9,'diterima_supplier','Amet cumque itaque aliquid quis porro non.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,6,'1998-06-26',5,'pending','Voluptate totam consequatur sunt sunt culpa fugiat.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,4,'2001-09-07',1,'dikirim','Aut non delectus unde dolorem qui omnis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,6,'2003-08-23',5,'diterima_supplier','Est blanditiis sint aliquid maiores sed et.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,17,'2019-02-13',7,'diterima_supplier','Mollitia voluptas inventore dicta velit dolorem et est.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,6,'1981-10-04',3,'diterima_supplier','Totam accusantium qui voluptate iure delectus maiores eaque.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,15,'1989-01-03',1,'diterima_supplier','Facilis sequi blanditiis ut nihil.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,14,'2014-11-10',7,'dikirim','Enim et mollitia vitae vel consequatur sapiente.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,10,'2010-08-05',4,'dikirim','Animi unde quidem et veniam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,7,'1985-12-21',1,'dikirim','Itaque vel doloremque maxime aut et adipisci.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,7,'1991-04-09',7,'diterima_supplier','Quas quibusdam voluptatem quia temporibus corrupti.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,19,'1994-05-03',3,'diterima_supplier','Autem accusantium facere dolorum magnam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,11,'1987-02-22',5,'diterima_supplier','Aut quia est modi qui.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,19,'1995-09-16',10,'pending','Ipsum veritatis accusamus voluptatem laboriosam quae accusantium.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,8,'2022-02-01',4,'dikirim','Facilis expedita et et.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,8,'1975-05-07',5,'pending','Quis error neque omnis nihil.','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `penggajian` */

DROP TABLE IF EXISTS `penggajian`;

CREATE TABLE `penggajian` (
  `id_penggajian` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_karyawan` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `gaji_pokok` decimal(15,2) NOT NULL,
  `tunjangan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `potongan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_gaji` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_penggajian`),
  KEY `penggajian_id_karyawan_foreign` (`id_karyawan`),
  CONSTRAINT `penggajian_id_karyawan_foreign` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawan` (`id_karyawan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `penggajian` */

LOCK TABLES `penggajian` WRITE;

UNLOCK TABLES;

/*Table structure for table `produk` */

DROP TABLE IF EXISTS `produk`;

CREATE TABLE `produk` (
  `id_produk` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_produk` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stok` int NOT NULL,
  `harga_beli` decimal(10,2) NOT NULL,
  `harga_jual` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_produk`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `produk` */

LOCK TABLES `produk` WRITE;

insert  into `produk`(`id_produk`,`nama_produk`,`kategori`,`stok`,`harga_beli`,`harga_jual`,`created_at`,`updated_at`) values 
(1,'Beras Premium','Sembako',50,10000.00,12500.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(2,'Gula Pasir','Sembako',70,12000.00,15000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(3,'Minyak Goreng','Sembako',30,14000.00,18000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(4,'Kopi Sachet','Minuman',100,2000.00,2500.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(5,'Teh Celup','Minuman',80,4000.00,6000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(6,'Mie Instan','Makanan',120,2500.00,3000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(7,'Roti Tawar','Makanan',20,8000.00,10000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(8,'Tepung Terigu','Sembako',40,7000.00,9000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(9,'Sabun Cuci Piring','Kebutuhan Rumah',60,5000.00,7000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(10,'Pasta Gigi','Kebutuhan Pribadi',50,8000.00,10000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(11,'Susu Bubuk','Minuman',25,45000.00,50000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(12,'Air Mineral 600ml','Minuman',200,1500.00,2000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(13,'Shampoo 200ml','Kebutuhan Pribadi',30,15000.00,18000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(14,'Detergen Bubuk','Kebutuhan Rumah',40,15000.00,20000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(15,'Snack Keripik','Makanan',100,5000.00,7000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(16,'Telur Ayam 1kg','Sembako',20,23000.00,25000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(17,'Baterai AA','Elektronik',30,8000.00,10000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(18,'Obat Nyamuk','Kebutuhan Rumah',45,10000.00,12000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(19,'Sikat Gigi','Kebutuhan Pribadi',60,3000.00,5000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46'),
(20,'Lampu LED','Elektronik',35,15000.00,20000.00,'2025-05-30 09:03:46','2025-05-30 09:03:46');

UNLOCK TABLES;

/*Table structure for table `purchase_order_items` */

DROP TABLE IF EXISTS `purchase_order_items`;

CREATE TABLE `purchase_order_items` (
  `id_item_po` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_po` bigint unsigned NOT NULL,
  `nama_barang` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi_barang` text COLLATE utf8mb4_unicode_ci,
  `jumlah` int NOT NULL,
  `harga_perkiraan` decimal(10,2) NOT NULL,
  `total_harga` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_item_po`),
  KEY `purchase_order_items_id_po_foreign` (`id_po`),
  CONSTRAINT `purchase_order_items_id_po_foreign` FOREIGN KEY (`id_po`) REFERENCES `purchase_orders` (`id_po`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `purchase_order_items` */

LOCK TABLES `purchase_order_items` WRITE;

insert  into `purchase_order_items`(`id_item_po`,`id_po`,`nama_barang`,`deskripsi_barang`,`jumlah`,`harga_perkiraan`,`total_harga`,`created_at`,`updated_at`) values 
(1,15,'ipsum','Eum minima omnis voluptas nulla harum voluptatem.',25,41788.00,100153.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,19,'ea','Perspiciatis nobis rerum eos accusantium.',7,79139.00,605934.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,6,'laboriosam','Est neque pariatur sed expedita harum praesentium.',18,54728.00,760644.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,3,'molestiae','Distinctio quidem ad hic temporibus.',50,10458.00,307748.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,1,'eaque','Numquam et itaque aut ex.',12,76324.00,174886.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,14,'veritatis','Sint mollitia velit optio ut laborum vel qui.',73,69306.00,704239.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,4,'eos','Ut libero sint ipsum accusantium.',83,78522.00,515863.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,15,'et','Minima perspiciatis sit et quos nam labore placeat.',87,93725.00,196848.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,8,'voluptate','Et eligendi corporis ullam enim consectetur.',16,29249.00,580956.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,15,'animi','Magnam optio dolores minima natus.',2,37863.00,557713.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,2,'aliquid','In ea placeat et necessitatibus atque sint dolores.',12,47696.00,842776.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,5,'explicabo','Commodi modi quas enim consequatur voluptatem ipsam non quas.',63,37040.00,592799.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,1,'voluptas','Nobis ipsa ad possimus perspiciatis soluta sit ea.',85,88381.00,628790.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,18,'nihil','Explicabo optio sed exercitationem laboriosam et quod.',65,96094.00,834053.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,5,'modi','Quam et quidem at.',68,91474.00,389899.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,5,'aut','Odit vel omnis enim rerum dolor laudantium expedita.',11,73982.00,879479.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,6,'enim','Ea rerum aperiam minus autem vel aliquam odit.',47,19338.00,980837.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,1,'reiciendis','Sunt repudiandae voluptate eum sed possimus corporis est quidem.',57,92660.00,538203.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,16,'fuga','Adipisci a facilis repellat dolor.',76,13567.00,479806.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,11,'velit','Magni ratione facilis cumque quos perspiciatis non.',33,64876.00,901863.00,'2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `purchase_orders` */

DROP TABLE IF EXISTS `purchase_orders`;

CREATE TABLE `purchase_orders` (
  `id_po` bigint unsigned NOT NULL AUTO_INCREMENT,
  `no_po` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dibuat_oleh` bigint unsigned NOT NULL,
  `waktu_dibuat` timestamp NOT NULL,
  `status` enum('pending','disetujui','selesai','dibatalkan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `waktu_disetujui` timestamp NULL DEFAULT NULL,
  `waktu_selesai` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_po`),
  UNIQUE KEY `purchase_orders_no_po_unique` (`no_po`),
  KEY `purchase_orders_dibuat_oleh_foreign` (`dibuat_oleh`),
  CONSTRAINT `purchase_orders_dibuat_oleh_foreign` FOREIGN KEY (`dibuat_oleh`) REFERENCES `karyawan` (`id_karyawan`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `purchase_orders` */

LOCK TABLES `purchase_orders` WRITE;

insert  into `purchase_orders`(`id_po`,`no_po`,`dibuat_oleh`,`waktu_dibuat`,`status`,`waktu_disetujui`,`waktu_selesai`,`created_at`,`updated_at`) values 
(1,'PO219',5,'2013-06-23 11:29:03','dibatalkan','2010-01-26 20:55:56','2015-06-28 01:35:41','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,'PO532',10,'1984-10-08 01:34:49','disetujui','1996-06-06 15:12:17','2025-03-11 04:14:00','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,'PO475',4,'2016-02-22 11:55:34','dibatalkan','1974-04-15 13:58:01','2018-05-11 20:36:42','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,'PO382',5,'1988-04-24 04:13:10','disetujui','1996-01-15 23:45:33','1991-06-10 07:04:36','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,'PO800',1,'2022-03-22 07:13:16','pending','2003-10-26 01:03:22','1982-12-11 06:10:23','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,'PO582',10,'2017-12-13 00:36:23','dibatalkan',NULL,NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,'PO912',3,'1999-07-12 19:25:37','dibatalkan','1979-04-26 08:04:07',NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,'PO953',6,'1979-03-18 05:11:38','disetujui',NULL,'1974-10-03 03:38:46','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,'PO051',7,'2011-07-22 11:28:15','disetujui','1984-12-22 15:29:13','1980-09-23 01:54:38','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,'PO367',4,'1991-11-22 14:44:38','selesai',NULL,NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,'PO524',10,'2007-07-18 09:18:09','selesai',NULL,'2013-10-06 04:18:28','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,'PO477',6,'1987-06-19 14:55:27','pending',NULL,NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,'PO452',8,'2022-08-14 10:41:55','selesai',NULL,'1997-04-21 17:01:49','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,'PO937',6,'1988-08-09 22:31:27','selesai',NULL,NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,'PO149',4,'1999-05-14 22:33:04','selesai',NULL,'1981-03-09 19:44:39','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,'PO802',3,'2014-02-19 04:44:22','disetujui','1985-02-09 07:19:26','2023-09-20 11:13:48','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,'PO669',4,'2016-05-17 13:28:25','selesai','2016-01-01 06:21:08','1985-06-16 12:16:47','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,'PO458',1,'1999-11-05 15:23:42','disetujui',NULL,'1977-07-26 07:47:45','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,'PO135',2,'1972-06-12 18:57:18','disetujui','2013-03-15 19:06:36','1972-07-08 10:18:36','2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,'PO193',7,'2009-11-25 15:42:26','selesai','2003-11-15 02:50:02',NULL,'2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `retur_barang` */

DROP TABLE IF EXISTS `retur_barang`;

CREATE TABLE `retur_barang` (
  `id_retur` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_po` bigint unsigned NOT NULL,
  `tanggal_retur` date NOT NULL,
  `diajukan_oleh` bigint unsigned NOT NULL,
  `status` enum('pending','disetujui','ditolak','selesai') COLLATE utf8mb4_unicode_ci NOT NULL,
  `alasan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_retur`),
  KEY `retur_barang_id_po_foreign` (`id_po`),
  KEY `retur_barang_diajukan_oleh_foreign` (`diajukan_oleh`),
  CONSTRAINT `retur_barang_diajukan_oleh_foreign` FOREIGN KEY (`diajukan_oleh`) REFERENCES `karyawan` (`id_karyawan`),
  CONSTRAINT `retur_barang_id_po_foreign` FOREIGN KEY (`id_po`) REFERENCES `purchase_orders` (`id_po`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `retur_barang` */

LOCK TABLES `retur_barang` WRITE;

insert  into `retur_barang`(`id_retur`,`id_po`,`tanggal_retur`,`diajukan_oleh`,`status`,`alasan`,`created_at`,`updated_at`) values 
(1,4,'1983-01-18',2,'disetujui','Vero accusantium recusandae aut id culpa laborum a atque.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,12,'2000-10-25',3,'pending','Quam eligendi excepturi quae illum facilis error.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,15,'2001-09-05',8,'pending','Soluta sit iure tenetur blanditiis officia neque ea rerum.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,19,'1982-10-10',10,'disetujui','Consequatur architecto ut fugit autem corrupti.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,13,'2025-02-05',4,'selesai','Accusamus a ea accusamus reiciendis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,8,'2002-03-27',4,'disetujui','Earum aliquam illum ullam ratione possimus rerum.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,12,'1975-11-06',4,'disetujui','Non nobis dicta atque beatae vero repellendus deserunt.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,12,'1973-11-26',1,'pending','Ad tenetur at ratione tempore quia nobis cumque.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,14,'2016-09-10',6,'ditolak','Quod recusandae doloremque eaque blanditiis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,12,'2001-04-15',5,'ditolak','Est architecto cupiditate ratione voluptas.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,17,'1982-11-07',7,'pending','Sequi ut doloremque eos placeat neque.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,13,'1972-07-24',10,'selesai','Voluptatem omnis explicabo facilis at.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,10,'1982-05-07',2,'selesai','Beatae natus nesciunt quo voluptatibus aut neque.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,20,'2011-11-04',2,'pending','Occaecati enim corporis sit laudantium et.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,19,'2017-02-02',1,'disetujui','Aut dolorem ipsam voluptate aliquam ad aliquam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,1,'2000-01-09',4,'ditolak','Impedit vel dolorem temporibus error nisi accusantium ullam.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,8,'1997-07-13',4,'ditolak','Quisquam eum quae ducimus iste asperiores reiciendis praesentium.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,17,'2008-09-03',9,'pending','Ut sapiente recusandae quam ab incidunt deserunt.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,11,'1999-04-27',6,'ditolak','Est cum ullam ipsam harum earum odit pariatur.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,14,'2011-07-25',1,'disetujui','Et quia et voluptatum nobis.','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `retur_barang_items` */

DROP TABLE IF EXISTS `retur_barang_items`;

CREATE TABLE `retur_barang_items` (
  `id_item_retur` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_retur` bigint unsigned NOT NULL,
  `id_item_po` bigint unsigned NOT NULL,
  `jumlah_diretur` int NOT NULL,
  `kondisi_barang` enum('rusak','tidak sesuai','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_item_retur`),
  KEY `retur_barang_items_id_retur_foreign` (`id_retur`),
  KEY `retur_barang_items_id_item_po_foreign` (`id_item_po`),
  CONSTRAINT `retur_barang_items_id_item_po_foreign` FOREIGN KEY (`id_item_po`) REFERENCES `purchase_order_items` (`id_item_po`),
  CONSTRAINT `retur_barang_items_id_retur_foreign` FOREIGN KEY (`id_retur`) REFERENCES `retur_barang` (`id_retur`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `retur_barang_items` */

LOCK TABLES `retur_barang_items` WRITE;

insert  into `retur_barang_items`(`id_item_retur`,`id_retur`,`id_item_po`,`jumlah_diretur`,`kondisi_barang`,`catatan`,`created_at`,`updated_at`) values 
(1,9,2,23,'lainnya','Dolore autem nesciunt enim neque beatae accusantium facilis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(2,6,13,51,'lainnya','Hic possimus fugiat quo est eos sint.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(3,6,13,51,'rusak','Qui tenetur eum reprehenderit nostrum ut aut non blanditiis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(4,14,19,93,'rusak','Nihil quos sint in perspiciatis ut dolore corrupti.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(5,19,4,24,'lainnya','Ut quia nemo rerum sint quibusdam libero voluptatem.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(6,10,2,86,'lainnya','Ut vero voluptas officiis rerum pariatur deleniti.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(7,15,15,12,'rusak','Voluptatem modi minima itaque rerum vel aspernatur ut voluptates.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(8,16,2,47,'tidak sesuai','Dignissimos blanditiis quasi harum officiis ea autem.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(9,19,17,19,'lainnya','Itaque qui est dignissimos voluptas eos dolore.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(10,7,6,12,'lainnya','Rem et id iste totam alias reprehenderit dolorum.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(11,18,17,13,'rusak','Labore ea delectus molestiae laborum et.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(12,5,19,9,'rusak','Laboriosam fugiat consequuntur porro repellat omnis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(13,19,11,63,'rusak','Dolor possimus beatae voluptatum provident aut quia in.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(14,9,15,26,'tidak sesuai','Ratione aut id voluptas consequatur sed est.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(15,15,12,45,'tidak sesuai','Facere facere quis deleniti qui.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(16,16,12,77,'lainnya','Fugit repellat non quia qui quis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(17,3,16,20,'lainnya','Labore modi iure culpa sint nobis sit dolore quis.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(18,3,12,96,'tidak sesuai','Et quasi voluptatem dolorem et rerum itaque sit rerum.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(19,19,2,36,'rusak','Quisquam maiores iure delectus aliquid.','2025-05-30 09:03:56','2025-05-30 09:03:56'),
(20,19,10,2,'lainnya','Quae nobis odit nobis ab error perferendis est.','2025-05-30 09:03:56','2025-05-30 09:03:56');

UNLOCK TABLES;

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id_role` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `role` */

LOCK TABLES `role` WRITE;

insert  into `role`(`id_role`,`role_name`,`description`,`created_at`,`updated_at`) values 
(1,'HRD','Human Resources Department',NULL,NULL),
(2,'Inventaris','Inventory Management',NULL,NULL),
(3,'Admin','Administrator role',NULL,NULL),
(4,'Keuangan','Finance Department',NULL,NULL),
(5,'Penjualan','Sale Department',NULL,NULL);

UNLOCK TABLES;

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sessions` */

LOCK TABLES `sessions` WRITE;

UNLOCK TABLES;

/*Table structure for table `shifts` */

DROP TABLE IF EXISTS `shifts`;

CREATE TABLE `shifts` (
  `id_shift` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_shift` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_shift`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `shifts` */

LOCK TABLES `shifts` WRITE;

insert  into `shifts`(`id_shift`,`nama_shift`,`jam_mulai`,`jam_selesai`,`created_at`,`updated_at`) values 
(1,'Pagi','07:00:00','15:00:00',NULL,NULL),
(2,'Sore','15:00:00','23:00:00',NULL,NULL),
(3,'Malam','23:00:00','07:00:00',NULL,NULL);

UNLOCK TABLES;

/*Table structure for table `stok_request` */

DROP TABLE IF EXISTS `stok_request`;

CREATE TABLE `stok_request` (
  `id_request` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tanggal_pengajuan` date NOT NULL,
  `id_produk` bigint unsigned NOT NULL,
  `jumlah` int NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_request`),
  KEY `stok_request_id_produk_foreign` (`id_produk`),
  CONSTRAINT `stok_request_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `stok_request` */

LOCK TABLES `stok_request` WRITE;

UNLOCK TABLES;

/*Table structure for table `stokopname` */

DROP TABLE IF EXISTS `stokopname`;

CREATE TABLE `stokopname` (
  `id_stokopname` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_produk` bigint unsigned NOT NULL,
  `tanggal_opname` date NOT NULL,
  `jumlah_sebenarnya` int NOT NULL,
  `selisih` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_stokopname`),
  KEY `stokopname_id_produk_foreign` (`id_produk`),
  CONSTRAINT `stokopname_id_produk_foreign` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `stokopname` */

LOCK TABLES `stokopname` WRITE;

insert  into `stokopname`(`id_stokopname`,`id_produk`,`tanggal_opname`,`jumlah_sebenarnya`,`selisih`,`created_at`,`updated_at`) values 
(1,12,'1978-02-13',51,-19,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,1,'2001-02-15',44,14,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,19,'1974-09-19',15,-85,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,18,'1975-11-20',70,-10,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,16,'2013-01-26',33,-87,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,1,'1982-09-24',59,39,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,12,'1977-03-03',89,49,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,12,'1978-07-23',68,8,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,19,'1978-05-31',70,20,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,13,'2023-12-11',12,-13,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,9,'1978-05-03',77,-123,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,5,'2005-06-16',34,4,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,16,'1992-05-07',65,25,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,14,'1977-02-22',88,-12,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,8,'2010-05-22',69,49,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,12,'2006-04-01',33,3,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,2,'1982-12-05',83,38,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,7,'1989-08-17',55,-5,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,19,'2008-08-29',59,24,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,7,'2015-08-17',65,15,'2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `supplier` */

DROP TABLE IF EXISTS `supplier`;

CREATE TABLE `supplier` (
  `id_supplier` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama_supplier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kontak` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_supplier`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `supplier` */

LOCK TABLES `supplier` WRITE;

insert  into `supplier`(`id_supplier`,`nama_supplier`,`kontak`,`alamat`,`created_at`,`updated_at`) values 
(1,'Johnson, Hand and Padberg','+1-979-514-6994','785 Bauch Summit\nStiedemannfort, ME 18308-6517','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(2,'Douglas, Balistreri and Schroeder','+1.629.222.7109','770 Una Orchard Suite 805\nMikelport, CO 87467-4254','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(3,'Reynolds, D\'Amore and Walker','321.736.4272','21053 Turner Isle Suite 361\nSouth Brooke, ME 69609','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(4,'Cormier-West','1-253-734-0738','276 Gislason Court\nMaggieshire, DC 09422','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(5,'Olson Ltd','617-901-1969','73531 Krystel Curve\nCarrieburgh, OH 83348','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(6,'Bednar LLC','860-798-6383','1784 Schinner Island\nMauricebury, IL 02935','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(7,'Wiegand-Fadel','(737) 595-6180','695 White Gateway\nNew Bettyhaven, VA 73812-1413','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(8,'Williamson-Flatley','743.678.3836','2724 Jaskolski Isle\nNorth Kristoffer, AZ 34665','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(9,'Fritsch Ltd','1-707-598-0268','67586 Bode Heights Suite 316\nCristinaview, NY 22334','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(10,'Willms-Dickens','1-765-847-0381','30639 Gleason Field Apt. 405\nWest Arianetown, WA 26951-6656','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(11,'Smitham, Reynolds and Rohan','+1-564-346-6577','4429 Bernie Flats Apt. 265\nLake Maria, WA 81652-8014','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(12,'Heathcote, Jaskolski and Wisozk','+1 (207) 684-9612','35277 Bauch Lake Apt. 789\nPort Wyattburgh, MT 30052','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(13,'Baumbach, Huels and Nader','351-284-6961','317 Anastasia Vista\nPort Felipaville, MO 52701','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(14,'Mante PLC','1-320-698-7467','9672 Jailyn Path\nNorth Jacquelyn, WA 47863','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(15,'Mitchell-Walsh','(314) 209-0228','33163 Rempel Heights Suite 820\nEast Lennafurt, WY 34980-2593','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(16,'Rodriguez LLC','+1-857-342-7690','5151 Imani Fork\nNew Arnold, VT 63998-2611','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(17,'Haley-Zulauf','+1.215.256.2781','449 Turcotte Fort\nSheldonfort, OK 20756','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(18,'Gulgowski-Carroll','726.313.1799','699 Alayna Flat\nKoeppland, MT 14562','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(19,'McClure-Dietrich','+1 (239) 661-3431','9180 Willa Summit Apt. 341\nHeaneyton, OK 71839','2025-05-30 09:03:47','2025-05-30 09:03:47'),
(20,'Murazik-Schimmel','+1 (502) 781-0960','62698 Armando Brook Apt. 649\nGreenfelderport, WI 02766','2025-05-30 09:03:47','2025-05-30 09:03:47');

UNLOCK TABLES;

/*Table structure for table `transaksi_penjualan` */

DROP TABLE IF EXISTS `transaksi_penjualan`;

CREATE TABLE `transaksi_penjualan` (
  `id_penjualan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_pelanggan` bigint unsigned NOT NULL,
  `tanggal_penjualan` date NOT NULL,
  `total_harga` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_penjualan`),
  KEY `transaksi_penjualan_id_pelanggan_foreign` (`id_pelanggan`),
  CONSTRAINT `transaksi_penjualan_id_pelanggan_foreign` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `transaksi_penjualan` */

LOCK TABLES `transaksi_penjualan` WRITE;

insert  into `transaksi_penjualan`(`id_penjualan`,`id_pelanggan`,`tanggal_penjualan`,`total_harga`,`created_at`,`updated_at`) values 
(1,10,'2012-07-10',452187.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(2,8,'2002-12-31',530684.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(3,11,'1988-05-29',237084.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(4,3,'1996-02-28',855279.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(5,5,'2018-07-23',932467.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(6,19,'1991-07-30',895058.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(7,3,'2020-04-23',597849.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(8,4,'1991-05-31',357060.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(9,5,'2004-03-08',526270.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(10,15,'1970-04-13',537656.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(11,16,'1997-07-18',790203.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(12,16,'1992-11-26',777112.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(13,11,'2000-05-18',997780.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(14,12,'2005-07-21',600996.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(15,8,'2003-02-24',188759.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(16,17,'2016-10-29',186640.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(17,12,'1987-07-22',757762.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(18,13,'2020-12-10',449950.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(19,12,'1988-08-01',520317.00,'2025-05-30 09:03:55','2025-05-30 09:03:55'),
(20,18,'1988-01-11',682845.00,'2025-05-30 09:03:55','2025-05-30 09:03:55');

UNLOCK TABLES;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `users` */

LOCK TABLES `users` WRITE;

insert  into `users`(`id`,`name`,`email`,`email_verified_at`,`password`,`remember_token`,`created_at`,`updated_at`) values 
(1,'Test User','test@example.com','2025-05-30 09:03:45','$2y$12$INNx4awdoyxoTovE377tBeFKYXYKkHWH9QiVrhn44vKXpFYk/TmTu','MCyItTWjVD','2025-05-30 09:03:45','2025-05-30 09:03:45');

UNLOCK TABLES;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
