-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2019 at 04:38 AM
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
(2, 'First Notice', 'This is the very first notice of this app.', 1, 1, '2019-01-23 18:37:51', '2019-01-23 18:37:51');

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `mobile_no`, `email_verified`, `mobile_no_verified`, `created_at`, `updated_at`) VALUES
(1, 'ganesh@gmail.com', 'ganesh', '$2a$10$Nxv5.tGoqHHwgOUrLaI2ceOYVWCKzirrYmwujSxl36LOlESyiTbfW', '9999999999', 0, 0, '2019-01-17 05:58:41', '2019-01-17 06:49:29'),
(2, 'shiva@gmail.com', 'shankar', '$2a$10$8vqQLlhIwInANHZD7fF3Puye0eZ/EUbcg7y4ckh4HLsO3jbfx2Tqu', '9999999998', 0, 0, '2019-01-17 06:55:47', '2019-01-17 06:55:47'),
(4, 'ganesha@gmail.com', 'ganesha', '$2a$10$BoKN9BQ2PWqdiM/qYNdbTeWd1EDQMIeA4hLLKM3/IZCO85/XOzeRy', '9876543210', 0, 0, '2019-01-19 10:36:51', '2019-01-19 10:36:51'),
(5, 'krishn@gmail.com', 'krishn', '$2a$10$rtR3GFau.cNiC19VzFoAReQu/UZnqOXvMT4.t3I5dRn4D5MTAi6Ay', '9876543211', 0, 0, '2019-01-19 15:24:50', '2019-01-19 15:24:50'),
(9, 'naman@think.in', 'namen', '$2a$10$2ghj4Ytu5DZMdj4RrwqJB.aNwDS1fxuq1.iPGNK6qERNLVijl19C.', '9654785625', 0, 0, '2019-01-23 06:41:10', '2019-01-23 06:41:10'),
(10, 'krishn@yadav.com', 'krishna', '$2a$10$v7uWtxPhKW/we58n3r38pO7uaNuIlqtRkN7etGMssrtOnarsuIeRS', '9654785621', 0, 0, '2019-01-23 06:42:50', '2019-01-23 06:42:50');

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
(2, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_notice_user` (`posted_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `notices`
--
ALTER TABLE `notices`
  ADD CONSTRAINT `FK_notice_user` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD CONSTRAINT `FK_userrole_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `FK_userrole_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
