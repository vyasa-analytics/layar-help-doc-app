# Layar GPT Help App v1

## About

This system will allow you to make targeted RAG queries investigating help files. An access code is required in order to distinguish which family of files the user needs to query. To obtain your access code contact Aryan Ghobadi, AI team (aryan.ghobadi@certara.com).

## Prerequisites

The prerequisites for this system are below, however the startup scripts will install these if your environment is detected to not have them.

- Node.js v16+
- npm
- React


## Setup and Run

There are startup scripts that have been included within the repository that will install all necessary prerequisite libraries and frameworks and deploy the application locally. Once you have cloned the repo, simply run the script. If you are a UNIX (MacOS, Linux) user, please run the following command to set up and start the application:

```bash
./startup.sh
```

If you are using a Windows environment, run the equivalent `startup.bat` script to setup and start the application. 

## Running and Using the application

This application uses Node.JS to interact with the Certara AI infrastructure ('Layar') on the backend, answering questions pertinent to a client's specific knowledge base/document family. Your access code is critical in order to ensure that questions asked utilise the correct set of documents when generating responses, ensure this field is filled before sending queries. TL;Dr - To make sure you're asking questions of the right documents, enter your client-specific access code that was provided to you.

## Feedback

This application runs using a Llama 3.1-70b model, which has a context window limit of 128k tokens, for larger document(s), this means that answers will be generated based on the most relevant derived sections up to this limit. As a result, this means that generated answers should be subject to scrutiny and feedback. This feedback will aid us in optimising query parameters/document organisation, maximising accurate retrieval and generation. TL;Dr - Let us know if an answer isn't what it ought to be


