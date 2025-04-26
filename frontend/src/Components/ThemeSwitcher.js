// src/components/ThemeSwitcher.js
import React, { useState, useEffect } from "react";
import "../Styles/ThemeSwitcher.css";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(theme === "light" ? "light-theme" : "dark-theme");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button className="theme-switcher-button" onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
};

export default ThemeSwitcher;
