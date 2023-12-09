# SolidSocialMedia

SolidSocial is a decentralized social media platform built on the [Solid](https://solidproject.org/) framework, empowering users with control over their personal data. Connect with friends, share posts, and discover content in a secure and privacy-focused environment. With features like seamless follow/unfollow functionality and easy post sharing, SolidSocial provides a user-friendly experience while respecting your digital rights. Explore the next generation of social networking with SolidSocial.

## Key Features

- **Decentralized:** Built on the Solid framework, giving users ownership and control of their data.
- **Follow/Unfollow:** Easily connect with others and manage your social connections.
- **Post Sharing:** Share your thoughts, experiences, and content with your network.
- **Privacy-Focused:** Prioritizing user privacy and data security.

## Technologies Used

- React
- @inrupt/solid-client
- @inrupt/solid-ui-react
- [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/)

## Get Started

Follow the installation and usage instructions in the README to experience a new era of social media powered by [Solid](https://solidproject.org/).

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wolf-77/solid-social-media.git
   ```
2. Change into the project directory:

   ```bash
   cd your-project
   ``` 
3. Install dependencies:

   ```bash
   npm install
   ```
4. Running the Web Application:
   
   ```bash
   npm start
   ```
5. Running the Community Solid Server:

   ```bash
   npx @solid/community-server
   ```
   or
   ```bash
   npx @solid/community-server -c @css:config/file.json -f data/
   ```
   To persist your pod's contents between restarts.

6. Visit http://localhost:5000 in your browser.

### Production Deployment
1. Build the production-ready bundle:
   ```bash
   npm run build
   ```

2. Follow the deployment instructions in the React documentation or the platform where you plan to deploy your application.

3. Configuring the Community Solid Server:
Follow the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/tree/main/documentation) documentation to configure the server for production.