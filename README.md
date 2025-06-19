
# REACH - Emergency App

This repository is for the **REACH** emergency app built as part of the NIRMAAN Summer 2025 Cohort. The app provides real-time emergency response services for users, integrated with live tracking and AI-based fake report detection.

### Key Features:
- **Real-time Tracking**: The app uses **Google Maps API** for live tracking of emergency vehicles and incidents.
- **Fake Report Detection**: The app includes AI-based detection to identify and filter out fake emergency reports.
- **Accessibility**: Users can make reports quickly and easily through the app, ensuring quick and accurate responses.

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Node.js, Socket.IO
- **AI Tools**: Hugging Face BART for transcript summarization
- **Google Maps API**: For live incident tracking
- **Data Analysis**: GPS data, EXIF metadata, Fake report detection

## How to Run the App Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reach-emergency-app.git
   ```

2. Navigate into the project directory:
   ```bash
   cd reach-emergency-app
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Start the app:
   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:3000` to start using the REACH emergency app.

## Project Structure

- **Web version (MERN stack)**: Includes full-stack implementation using MongoDB, Express, React, and Node.js.
- **Web version (No code)**: Version of the app built without custom backend code.
- **App version**: The mobile app version of the REACH app, developed for both iOS and Android.
- **App version (No code)**: Mobile version built without custom backend logic.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to fork this repository and submit pull requests for improvements or fixes. If you encounter any issues, please open an issue in the repository.

---

Made with ❤️ by [CyberRik](https://github.com/CyberRik)
