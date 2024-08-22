# ![](https://raw.githubusercontent.com/SCAICT/physical-CTF/main/public/favicon.png) Physical CTF

A website for reporting Physical CTF Flags. You've been coding for too long—it's time to get out and touch some grass.

> 繁體中文版本的文檔可在[這裡](README.zh.md)找到。

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/1IW0VW?referralCode=Edit-Mr)

![screenshots](https://raw.githubusercontent.com/SCAICT/physical-CTF/main/demo/home.en.png)

Welcome to the Physical CTF Reporting Website. This web application allows users to submit and collect flags and manage them through a backend interface. This documentation will guide you through the steps of installation, configuration, usage, and flag management.

This game typically involves printing several flags with QR codes (usually printed on A4 paper and attached to chopsticks). The game master or teams hide the flags in designated areas. The team that collects the most flags within the time limit wins.

Here’s the standard link format:

```bash
https://<your-domain>.com/flag?flag=<your-flag>
```

For example: https://flag.scaict.org/flag?flag=flag{iL0veSCAICT}

## Table of Contents

- [ Physical CTF](#-physical-ctf)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage Instructions](#usage-instructions)
    - [Submitting Flags](#submitting-flags)
  - [Backend Management](#backend-management)
    - [Example](#example)
  - [API Endpoints](#api-endpoints)
    - [GET `/`](#get-)
    - [GET `/list`](#get-list)
    - [GET `/flag`](#get-flag)
    - [POST `/sendFlag`](#post-sendflag)
    - [GET `/admin`](#get-admin)
    - [POST `/admin`](#post-admin)
- [License](#license)

## Installation

> You can quickly deploy the application to the Zeabur platform by clicking the "Deploy on Zeabur" button.
> 
> [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/1IW0VW?referralCode=Edit-Mr)

Before starting, ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. Then, follow these steps to install the application:

1. Clone the project:
    ```bash
    git clone https://github.com/SCAICT/physical-flag.git
    cd physical-flag
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the project root directory and add the following content to configure the admin password:

```
ADMIN_PASSWORD=yourpassword
SECRET=yoursecret
```

Replace `yourpassword` with your desired admin password, and `yoursecret` with a random string.

## Usage Instructions

1. Start the server:
    ```bash
    npm start
    ```

2. Visit `http://localhost:3000` in your browser to view the application homepage.

### Submitting Flags

Users can submit flags through a form. The submitted flag will be verified against the database, and if it exists and hasn't been collected by the current user, it will be recorded.

## Backend Management

![Admin Interface](https://raw.githubusercontent.com/SCAICT/physical-CTF/main/demo/admin.en.png)

Admins can add or remove flags via the backend management page.

1. Visit `http://localhost:3000/admin` in your browser to access the admin page.
2. Enter the admin password.
3. Add or remove flags in the textarea (one per line).
4. Click the "Update Flags" button to save changes.

### Example

```plaintext
flag{new_flag_1}
flag{new_flag_2}
flag{new_flag_3}
```

Once submitted, these flags will be added to the database.

## API Endpoints

### GET `/`

Displays the homepage.

### GET `/list`

Returns the leaderboard of users who have collected flags.

Sample response:
```json
[
    {"user": "Alice", "score": 3},
    {"user": "Bob", "score": 2}
]
```

### GET `/flag`

Displays the flag submission page.

### POST `/sendFlag`

Submits a flag.

Request body:
```json
{
    "flag": "SCAICT{example_flag}",
    "username": "Alice"
}
```

Sample response:
```plaintext
Alice successfully collected SCAICT{example_flag}
```

### GET `/admin`

Displays the admin page.

### POST `/admin`

Updates flags.

Request body:
```json
{
    "password": "yourpassword",
    "flags": "SCAICT{new_flag_1}\nSCAICT{new_flag_2}\nSCAICT{new_flag_3}"
}
```

Sample response:
```plaintext
Flags updated successfully
```

# License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
```