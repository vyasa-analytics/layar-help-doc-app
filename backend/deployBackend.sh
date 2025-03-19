#!/bin/bash

LAMBDA_FUNCTION_NAME="layar-help-doc-chatbot"
REMOTE_USER="aghobadi"
REMOTE_HOST="dldev01.vyasa.com"
REMOTE_PATH="/home/aghobadi"
ZIP_NAME="lambda-deployment.zip"

echo "Creating Lambda deployment package..."
zip $ZIP_NAME index.js package.json node_modules/ -r

echo "Copying deployment package to remote server..."
scp $ZIP_NAME $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

echo "Updating Lambda function..."
ssh $REMOTE_USER@$REMOTE_HOST "aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://$REMOTE_PATH/$ZIP_NAME"

echo "Cleaning up..."
rm $ZIP_NAME
ssh $REMOTE_USER@$REMOTE_HOST "rm $REMOTE_PATH/$ZIP_NAME"

echo "Lambda update complete!"