# Check24 Messenger Implementation
My solution for the Gen Dev Messenger Challenge
https://github.com/check24-scholarships/check24-messenger-challenge

## Approach

The idea was to create a mobile responsive web app thats allows a user to have an overview of his chats and be able to view all the messages for each of them. To be able to switch users and for the chat app to be realistic and secure, I added a login system which authenticates the user via username and password, verifies it and provides him with a JWT token as a session token. Once logged in, he can perform the actions specified in the task like sending quotes, messages, files, archiving chats and more, all on a single page in the chat overview. I opted for the quote message to become an interactive element and have it update when the state of the conversation changes, for example when the user accepts an offer via the accept button in the quote message.

 I also added an unread banner, continuous fetching of new messages / conversations, unread counts and an overview of the individual last messages in the chat list as well as profile pictures to each of the users to make the interface more feature rich and visually appealing.


## Design

### Mockups

 ![Low fidelity mockups](https://s3.check24.gedeonlenz.com/readme/res/img/mockups.png)
 Low fidelity mockups (Final implementation deviates from initial mockups) 

### Screenshots

 ![Screenshot Login](https://s3.check24.gedeonlenz.com/readme/res/img/screenshotlogin.png " =832x476")
 Screenshot Login page
 

 ![Screenshot chat](https://s3.check24.gedeonlenz.com/readme/res/img/screenchat.jpg)
 Screenshot chat page

### Design philosophy

The main design philosophy was to create a clean, simple and inviting chat interface. The choice of a more rounded aesthetic does not only make the interface look nicer, but also bring a softer, more approachable feel, suggesting a user-friendly environment and contributing to a visually inviting interface. The curvature in elements, paired with a vibrant color palette featuring the prominent blue accent, aligns with the brand identity of check24 while also enhancing the overall visual appeal. Opting for a simple and minimalistic design is a conscious choice aimed at improving user intuitiveness. A minimalist approach mostly removes unnecessary visual clutter, simplifying navigation for the user and thereby reducing cognitive load as well as creating a clean, uncluttered space that allows the user to focus on the key interaction of chatting and purchasing without any obstacles getting in the way of a potential purchase. In essence, the design philosophy of the app tries to prioritizes both the aesthetic appeal and the functional elegance of a minimalistic approach, offering a beautiful, simple and intuitively navigable experience for the user.

## Structure

### User Flow

 ![User flow diagram](https://s3.check24.gedeonlenz.com/readme/res/img/userflow.svg)
 User flow diagram

### Data model

 ![](https://s3.check24.gedeonlenz.com/readme/res/img/database.svg)
 Data model diagram


## Technologies

To realize this project, the following technologies were used:

### SvelteKit Web Framework

As the web framework for frontend and backend, I chose SvelteKit. SvelteKit is relatively new a web application framework that extends the capabilities of the Svelte framework, providing a structured approach for building more efficient web applications. 

It comes with features like file-based routing and server-side rendering, streamlining the development process. 

SvelteKit utilizes Svelte's reactive programming model, compiling components at build time to optimize JavaScript for smaller bundles and faster loading. 

### MongoDB Database

As the Database, I opted to go with MongoDB. MongoDB is a NoSQL, document-oriented database designed for scalability and flexibility with unstructured data which comes in handy in combination with using Type/JavaScript for managing data in SvelteKit. It uses BSON for data storage and it supports horizontal scaling via sharding, automatic data distribution, and flexible schema updates. 

MongoDB employs a distributed, replica-set model for high availability and fault tolerance, along with a versatile query language and indexing options for optimized performance. 

### S3 Object Storage

To store files like images and documents users send each other, I chose to use an S3 based storage Solution. 

S3 based services are object storage solutions that adhere to the API and design principles of Amazon S3. 

S3, regardless of the specific provider, offers advantages such as durability, scalability, and high availability. 

Users as myself are able to seamlessly scale their storage needs. The straightforward web services interface simplifies data management. Features like versioning, access control, and server-side encryption enhance data security, while the pay-as-you-go pricing model ensures cost-effectiveness. 

S3-compatible services have become widely adopted for various use cases in the recent years, one of which being mostly static website hosting. They offer a versatile and reliable solution for data management.


## Deployment

### GitHub

GitHub serves as the storage for the projects repository and code base as required by the task.

### Vercel Frontend Cloud

Using the aforementioned GitHub Repository, I am able to deploy my application on Vercels Frontend Cloud. Despite the name, I am able to host my frontend as well as backend in the form of my SvelteKit project using their platform in just a few clicks. They also allow for continuous deployment resulting in new commits on the main branch of my GitHub Repository automatically triggering Vercels cloud to rebuild my application and deploy the new version.

These serverless platforms tend to be very scalable as well as reliable. They provide a range of performance optimization features, are designed to ensure that web applications load quickly and run smoothly, even as traffic scales and their global content delivery networks (CDNs), edge caching, and serverless infrastructure allows them to automatically optimize assets, reduce latency, and ensure that applications remain performant and responsive, no matter the number of users. They also incorporate redundancy, failover, and load balancing features that help ensure the applications remain available and performant, even during periods of high traffic or infrastructure failures, therefore minimizing downtime and reducing the risk of data loss.

### MongoDB Atlas

As my MongoDB host, I chose the first party hosting option MongoDB Atlas because it offers a generous free tier and lets you select an AWS location for the database that resides in Germany / Europe.

MongoDB Atlas is a fully managed cloud database service that allows users to deploy, manage, and scale MongoDB databases in minutes. It offers a seamless and automated experience for database administration which makes it much simpler to set up and allows me as a developer to focus on building the application itself. In addition, it provides features such as backups, monitoring, and scaling, ensuring high availability and performance for any application. As mentioned before, it supports various cloud providers, including AWS, but also Azure, and Google Cloud. With security features like encryption, MongoDB Atlas ensures the confidentiality and integrity of the data stored.

### Cloudflare R2

As my S3 service provider, I chose Cloudflare R2 because of the fast performance, its transparent pricing and my existing DNS setup on Cloudflare for adding a custom S3 domain (s3.check24.gedeonlenz.com).

Similar to Amazon S3, Cloudflare R2 allows developers to store and retrieve large amounts of data, such as images, videos, and other content, in the cloud. It's built on Cloudflare's global network, leveraging its widespread points of presence to ensure low-latency access and high availability of stored data. Cloudflare R2 emphasizes simplicity and performance, aiming to simplify the process of storing and serving data while offering robust security features. 

### ImageKit.io

ImageKit is the service I use for compressing and serving images / files uploaded by the user to the the Cloudflare R2 storage. This results in faster load times of the chat application.

## Demo

A live demo is available here: <https://check24.gedeonlenz.com>

Usernames: Hanna Müller (Customer), Tom Winter (Service Provider)

Password: CheckedIn24 (Both users)

## Run using Docker

**NOTICE: The recommended way to view the project is through the live demo.** 

### Steps

Clone the repository:

```javascript
https://github.com/GedeonLenz/check24.git
```

Add a .env file to the projects root directory and fill in the required values

```javascript
SECRET_DB_URI=MONGODB_CONNECTION_STRING_HERE
SECRET_JWT_KEY=RANDOM_LONG_STRING
SECRET_STORAGE_S3_ENDPOINT=YOUR_S3_ENDPOINT
SECRET_STORAGE_S3_ACCESSKEY=YOUR_S3_ACCESS_KEY
SECRET_STORAGE_S3_SECRETKEY=YOUR_S3_SECRET_KEY
SECRET_STORAGE_S3_REGION=YOUR_S3_REGION
SECRET_STORAGE_S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME
SECRET_STORAGE_S3_DIRECTORY=YOUR_DIRECTORY_PATH_ENDING_WITH_/
SECRET_STORAGE_S3_PUBLIC_URL=YOUR_PUBLIC_BUCKET_URL_ENDING_WITH_/
```

Run in project root:

```javascript
docker-compose build 
```

Run in project root:

```javascript
docker-compose up -d
```

## Run locally

**NOTICE: The recommended way to view the project is through the live demo.** 

I can not guarantee that the local setup will work seamlessly on every machine for every .env configuration

### Steps

Clone the repository:

```javascript
https://github.com/GedeonLenz/check24.git
```

Run in project root:

```javascript
npm install
```

Add a .env file to the projects root directory and fill in the required values

```javascript
SECRET_DB_URI=MONGODB_CONNECTION_STRING_HERE
SECRET_JWT_KEY=RANDOM_LONG_STRING
SECRET_STORAGE_S3_ENDPOINT=YOUR_S3_ENDPOINT
SECRET_STORAGE_S3_ACCESSKEY=YOUR_S3_ACCESS_KEY
SECRET_STORAGE_S3_SECRETKEY=YOUR_S3_SECRET_KEY
SECRET_STORAGE_S3_REGION=YOUR_S3_REGION
SECRET_STORAGE_S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME
SECRET_STORAGE_S3_DIRECTORY=YOUR_DIRECTORY_PATH_ENDING_WITH_/
SECRET_STORAGE_S3_PUBLIC_URL=YOUR_PUBLIC_BUCKET_URL_ENDING_WITH_/
```

(For obvious reasons I can not provide the values I used here)

Run in project root:

```javascript
npm run build
```

Run in project root:

```javascript
 npm run preview
```
(Additional adapters might need to be installed and configured for this to work.)

Alternatively:
Run in project root:

```javascript
 npm run dev
```


## Optimizations

A list of possible optimizations and features for the future:

* Integration of payment provider and creation of payment page
* In chat preview of other file formats besides images like video, audio, ms office and so on
* In chat preview of links and making urls in chats clickable
* Compress media files that are send (Done)
* More soft animations when opening /closing a chat / archive / popups
* Clicking on images or media to invoke full size preview
* Deletion of conversations besides the existing feature of archiving a chat
* Register page and Password reset system
* Extending the user object by fields like email, physical address and so on
* Better performance / reducing loading screen time. Maybe moving towards a more “fat-client” approach.
* Adding caching server(maybe Redis) side as well as client side
* Design components to follow the atomic design philosophy
* More specific error messages
* Scroll to top button for long conversations to reach the quote message
* See reviews for service providers when engaging in a Chat
* Add discovery / overview page for customer requests and the ability to send a quote for a listed customer request
* Add profile pages for each user
* Encrypt saved chat messages
