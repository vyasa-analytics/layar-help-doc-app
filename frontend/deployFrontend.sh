#!/bin/bash

# deploy-frontend-remote.sh
# Make the script executable with: chmod +x deploy-frontend-remote.sh

# Configuration
S3_BUCKET="layar-help-doc-chatbot"
REMOTE_USER="aghobadi"
REMOTE_HOST="dldev01.vyasa.com"
REMOTE_PATH="/home/aghobadi"
BUILD_DIR="build"
ZIP_NAME="frontend-deployment.zip"

echo "Building React app..."
npm run build

echo "Creating deployment package..."
cd $BUILD_DIR
zip -r ../$ZIP_NAME *
cd ..

echo "Copying deployment package to remote server..."
scp $ZIP_NAME $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

echo "Deploying to S3..."
ssh $REMOTE_USER@$REMOTE_HOST "
    rm -rf $REMOTE_PATH/$BUILD_DIR
    mkdir -p $REMOTE_PATH/$BUILD_DIR
    unzip $REMOTE_PATH/$ZIP_NAME -d $REMOTE_PATH/$BUILD_DIR
    aws s3 sync $REMOTE_PATH/$BUILD_DIR s3://$S3_BUCKET
    rm -rf $REMOTE_PATH/$BUILD_DIR
    rm $REMOTE_PATH/$ZIP_NAME
"

echo "Cleaning up..."
rm $ZIP_NAME

echo "Frontend deployment complete!"
echo "Your site should be available at: http://$S3_BUCKET.s3-website-us-east-1.amazonaws.com"