"use client";
import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-4 text-center text-sm bg-gray-900 bg-opacity-50 rounded-t-lg backdrop-blur-md"
    >
      <motion.p
        whileHover={{ scale: 1.05 }}
        className="text-gray-400 tracking-wider"
      >
        &copy; {new Date().getFullYear()} unFilo 🚀
      </motion.p>
    </motion.footer>
  );
}

export default Footer;
