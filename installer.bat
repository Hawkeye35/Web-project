@echo off
title Install requirements

echo Install dependencies
npm install

echo.
echo Setting up database

mysql -u root < sql\webproject.sql

echo.
echo Setup complete.

pause
