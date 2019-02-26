-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 26, 2019 at 09:02 AM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learning_api`
--

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `details` text,
  `type_id` int(11) NOT NULL COMMENT 'MIME Type of material',
  `path` varchar(300) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_premium` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `subject_id`, `title`, `subtitle`, `details`, `type_id`, `path`, `created_by`, `created_at`, `updated_at`, `is_premium`) VALUES
(1, 12, 'Head First Android Development', 'Head First Android Development, A brain friendly guide', 'Everybody wants a smartphone or tablet, and Android devices are hugely popular. In this book, we’ll teach you how to develop your own apps, and we’ll start by getting you to build a basic app and run it on an Android Virtual Device. Along the way, you’ll meet some of the basic components of all Android apps, such as activities and layouts. And by the end we will have most of the  android concepts in mind on the basis of which we can build more poerful apps.', 2, '/assets/material/12/1.pdf', 1, '2019-02-02 05:50:40', '2019-02-06 06:51:34', 1),
(2, 12, 'Developing with Android Studio', 'Learn to develop Android apps with this complete yet gentle introduction to the Android platform with Android Studio.', 'Android Studio (shown in Figure 6-1) is the IDE for Android that was announced in May 2013 at the Google I/O developers event, and is intended as an alternative to Eclipse. At the time of this writing, Android Studio is currently in Early Access Preview, with the most recent version being 0.0.5. At this time, Android Studio is not ready for full end-to-end Android application development, but should be ready in the coming months. I highly advise you review this chapter, as this is where Android development is migrating to in the future. Android Studio is based on the Java IDE called IntelliJ. If you’ve worked with other products by JetBrains (developer of IntelliJ), such as RedMine, PyCharm, PhpStorm, WebStorm, or AppCode, you will find yourself at home. All In telliJ products share the same shell IDE, which you’ll see as soon as you open up Android Studio. In this chapter, I intend to familiarize you with Android Studio and show how you can use it for Android development.', 2, '/assets/material/12/2.pdf', 1, '2019-02-02 11:27:28', '2019-02-05 11:23:48', 1),
(3, 12, 'Android Studio Cookbook', 'Design, debug, and test your apps using Android Studio', 'Android Studio is the best IDE for developing Android apps, and it is available for free to anyone who wants to develop professional Android apps.', 2, '/assets/material/12/3.pdf', 1, '2019-02-02 16:37:54', '2019-02-26 04:45:44', 0);

-- --------------------------------------------------------

--
-- Table structure for table `mime_types`
--

CREATE TABLE `mime_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` varchar(50) NOT NULL,
  `details` text,
  `logo_path` varchar(300) DEFAULT '/assets/public/images/app-logo.png'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `mime_types`
--

INSERT INTO `mime_types` (`id`, `name`, `value`, `details`, `logo_path`) VALUES
(1, 'JPG', 'image/jpeg', 'JPG image files.', '/assets/public/images/types/1.png'),
(2, 'PDF', 'application/pdf', 'All PDF (Portable Document File) type files. That can also be opened with Acrobat Readers.', '/assets/public/images/types/2.png'),
(3, 'Text ODT', 'application/vnd.oasis.opendocument.text', 'Open Document Text Format', '/assets/public/images/types/3.png');

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `details` text NOT NULL,
  `posted_by` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`id`, `title`, `details`, `posted_by`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'First Notice', 'This is the very first notice of this app.', 1, 1, '2019-01-23 18:37:51', '2019-01-23 18:37:51'),
(3, 'Second', 'This is a new notice from admin panel.', 1, 1, '2019-01-23 19:00:45', '2019-01-23 19:00:45');

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `details` text NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `duration_scale` varchar(20) DEFAULT NULL,
  `rate` float NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `title`, `subtitle`, `details`, `duration`, `duration_scale`, `rate`, `created_by`, `modified_by`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Silver', 'Silver pack of Jan jagruti', 'Full access for 6 months, all the subject and all the materials will be accessible.', 6, 'month', 100, 1, 1, 1, '2019-02-23 06:21:05', '2019-02-26 06:59:27');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `details` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `details`) VALUES
(1, 'Admin', 'Has access to admin panel'),
(2, 'Learner', 'Has access to learning content');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `details` text,
  `logo_path` varchar(300) NOT NULL DEFAULT '/assets/public/images/app-logo.png',
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `title`, `subtitle`, `details`, `logo_path`, `created_by`, `is_active`, `created_at`, `updated_at`) VALUES
(12, 'Android', 'Mobile Application development with Android, Java and Android Studio', 'Android is a mobile operating system developed by Google.\n\nWhat you\'ll learn:\n- A  good overview of the Java programming language\n- Install Android Studio and setup the environment\n- Android application design\n- Basic interactive app development', '/assets/public/images/subject/12.png', 1, 1, '2019-02-02 05:35:55', '2019-02-12 04:46:18');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `txn_id` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `details` text,
  `amount` float NOT NULL,
  `package_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `request_hash` varchar(200) DEFAULT NULL,
  `response_hash` varchar(200) DEFAULT NULL,
  `response` text,
  `completion_time` datetime DEFAULT NULL COMMENT 'Transaction Completion Time Success/Failure',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction Initiation time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `txn_id`, `title`, `details`, `amount`, `package_id`, `status`, `request_hash`, `response_hash`, `response`, `completion_time`, `created_at`, `updated_at`) VALUES
(32, 2, 'JNJ881f23aad297bb4044c8', 'Silver', 'Purchase of Silver, Silver pack of Jan jagruti', 200, 1, 'failure', '849c2305be592d9724abb1be0d7730292e44a02df4ea5547e7f0445e5af8a9ae701c8bb724562dd218bfb8ce50000269159fd2b999fea223c4433932be1070a1', NULL, NULL, '2019-02-25 11:36:50', '2019-02-25 11:36:13', '2019-02-25 11:36:50'),
(33, 2, 'JNJ3a06feb2d82855a1ff9b', 'Silver', 'Purchase of Silver, Silver pack of Jan jagruti', 200, 1, 'success', '730e6f2b4506f982956829d68e0308b26d6bcfe6d12901f84953245ede13ce9d15ca5ba2fbfd58500a9cabaaa517b83518542280e9cdbfa375f1bd20cec45d71', '135ee991d351750a3e7316f37e6a99c03c01a50b11e9d3ab629353c926d703397ebb340fe413dd4f1a3a7c32cc12ec9164ae3c28276c83d9cb8897faac434078', '{\"isConsentPayment\":\"0\",\"mihpayid\":\"271496\",\"mode\":\"CC\",\"status\":\"success\",\"unmappedstatus\":\"captured\",\"key\":\"3qgaet2f\",\"txnid\":\"JNJ3a06feb2d82855a1ff9b\",\"amount\":\"200.00\",\"addedon\":\"2019-02-25 17:59:59\",\"productinfo\":\"Silver\",\"firstname\":\"shankar\",\"lastname\":\"\",\"address1\":\"\",\"address2\":\"\",\"city\":\"\",\"state\":\"\",\"country\":\"\",\"zipcode\":\"\",\"email\":\"shiva@gmail.com\",\"phone\":\"9999999998\",\"udf1\":\"1\",\"udf2\":\"2\",\"udf3\":\"\",\"udf4\":\"\",\"udf5\":\"\",\"udf6\":\"\",\"udf7\":\"\",\"udf8\":\"\",\"udf9\":\"\",\"udf10\":\"\",\"hash\":\"135ee991d351750a3e7316f37e6a99c03c01a50b11e9d3ab629353c926d703397ebb340fe413dd4f1a3a7c32cc12ec9164ae3c28276c83d9cb8897faac434078\",\"field1\":\"727247\",\"field2\":\"923705\",\"field3\":\"20190225\",\"field4\":\"MC\",\"field5\":\"417370038231\",\"field6\":\"00\",\"field7\":\"0\",\"field8\":\"3DS\",\"field9\":\" Verification of Secure Hash Failed: E700 -- Approved -- Transaction Successful -- Unable to be determined--E000\",\"PG_TYPE\":\"AXISPG\",\"encryptedPaymentId\":\"884037006530D88BBF19E46FC414B72D\",\"bank_ref_num\":\"727247\",\"bankcode\":\"MAST\",\"error\":\"E000\",\"error_Message\":\"No Error\",\"name_on_card\":\"payu\",\"cardnum\":\"512345XXXXXX2346\",\"cardhash\":\"This field is no longer supported in postback params.\",\"amount_split\":\"{\\\"PAYU\\\":\\\"200.0\\\"}\",\"payuMoneyId\":\"511849\",\"discount\":\"0.00\",\"net_amount_debit\":\"200\"}', '2019-02-25 12:30:08', '2019-02-25 12:28:46', '2019-02-25 12:30:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `mobile_no_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_code` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `mobile_no`, `email_verified`, `mobile_no_verified`, `verification_code`, `created_at`, `updated_at`) VALUES
(1, 'ganesh@gmail.com', 'ganesh', '$2a$10$Nxv5.tGoqHHwgOUrLaI2ceOYVWCKzirrYmwujSxl36LOlESyiTbfW', '9999999999', 0, 0, NULL, '2019-01-17 05:58:41', '2019-01-17 06:49:29'),
(2, 'shiva@gmail.com', 'shankar', '$2a$10$r0rGd42ywyqTJxkvv7tzEeCIghLMy8X/.4ESzRSjgGWWJIFT1Q9Va', '9999999998', 1, 0, NULL, '2019-01-17 06:55:47', '2019-02-23 09:03:57'),
(4, 'ganesha@gmail.com', 'ganesha', '$2a$10$BoKN9BQ2PWqdiM/qYNdbTeWd1EDQMIeA4hLLKM3/IZCO85/XOzeRy', '9876543210', 0, 0, NULL, '2019-01-19 10:36:51', '2019-01-19 10:36:51'),
(5, 'krishn@gmail.com', 'krishn', '$2a$10$rtR3GFau.cNiC19VzFoAReQu/UZnqOXvMT4.t3I5dRn4D5MTAi6Ay', '9876543211', 1, 0, NULL, '2019-01-19 15:24:50', '2019-02-25 12:26:03'),
(6, 'thankijignesh@live.com', 'jig', '$2a$10$Y1CzhIfkHaTk3pn/b0xcFOy0/.kxtZAFd8Rj..CSzGv0HWoSmuEt2', '9712375458', 0, 0, NULL, '2019-01-22 09:04:56', '2019-01-22 09:04:56'),
(9, 'naman@think.in', 'namen', '$2a$10$2ghj4Ytu5DZMdj4RrwqJB.aNwDS1fxuq1.iPGNK6qERNLVijl19C.', '9654785625', 0, 0, NULL, '2019-01-23 06:41:10', '2019-01-23 06:41:10'),
(10, 'krishn@yadav.com', 'krishna', '$2a$10$v7uWtxPhKW/we58n3r38pO7uaNuIlqtRkN7etGMssrtOnarsuIeRS', '9654785621', 0, 0, NULL, '2019-01-23 06:42:50', '2019-01-23 06:42:50'),
(17, 'divyeshv789@gmail.com', 'Divyesh', '$2a$10$lMFKH7nETiQAsmKw9YO7geOtvQdEpLvu2R86xCuhcK6k/LfCxOWoS', '9033888452', 1, 0, NULL, '2019-02-08 17:56:11', '2019-02-09 15:25:42');

-- --------------------------------------------------------

--
-- Table structure for table `users_packages`
--

CREATE TABLE `users_packages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `validity_start` datetime NOT NULL,
  `validity_end` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users_packages`
--

INSERT INTO `users_packages` (`id`, `user_id`, `package_id`, `transaction_id`, `validity_start`, `validity_end`, `is_active`, `created_at`, `updated_at`) VALUES
(21, 2, 1, 33, '2019-02-25 12:30:08', '2019-08-25 12:30:08', 1, '2019-02-25 12:30:08', '2019-02-25 12:30:08');

-- --------------------------------------------------------

--
-- Table structure for table `users_roles`
--

CREATE TABLE `users_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users_roles`
--

INSERT INTO `users_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(5, 2),
(17, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_material_subject` (`subject_id`),
  ADD KEY `FK_material_type` (`type_id`),
  ADD KEY `FK_material_creator` (`created_by`);

--
-- Indexes for table `mime_types`
--
ALTER TABLE `mime_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_notice_user` (`posted_by`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_package_creator` (`created_by`),
  ADD KEY `FK_package_modifier` (`modified_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_subject_user` (`created_by`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `txn_id` (`txn_id`),
  ADD UNIQUE KEY `txn_id_2` (`txn_id`),
  ADD UNIQUE KEY `txn_id_3` (`txn_id`),
  ADD KEY `FK_transaction_user` (`user_id`),
  ADD KEY `FK_transaction_package` (`package_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_packages`
--
ALTER TABLE `users_packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_userpackage_user` (`user_id`),
  ADD KEY `FK_userpackage_package` (`package_id`),
  ADD KEY `FK_userpackage_transaction` (`transaction_id`);

--
-- Indexes for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FK_userrole_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT for table `mime_types`
--
ALTER TABLE `mime_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `users_packages`
--
ALTER TABLE `users_packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `FK_material_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_material_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FK_material_type` FOREIGN KEY (`type_id`) REFERENCES `mime_types` (`id`);

--
-- Constraints for table `notices`
--
ALTER TABLE `notices`
  ADD CONSTRAINT `FK_notice_user` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `FK_package_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_package_modifier` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `FK_subject_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `FK_transaction_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`),
  ADD CONSTRAINT `FK_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_packages`
--
ALTER TABLE `users_packages`
  ADD CONSTRAINT `FK_userpackage_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`),
  ADD CONSTRAINT `FK_userpackage_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  ADD CONSTRAINT `FK_userpackage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD CONSTRAINT `FK_userrole_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `FK_userrole_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
