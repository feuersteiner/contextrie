#!/bin/bash

# This generates a new OpenAI resource in Azure and creates a deployment for the Contextrie model
# you can use in demo/demo.ts

# CONFIGURE THESE
SUBSCRIPTION_ID="<YOUR SUBSCRIPTION ID>"
RESOURCE_GROUP="<YOUR RESOURCE GROUP NAME>" #ctx-rg for example
LOCATION="eastus"  # or your preferred region
ACCOUNT_NAME="contextrie-openai-$(date +%s)"  # unique name
DEPLOYMENT_NAME="contextrie-model"

# Model Options
MODEL_NAME="gpt-4o-mini"
MODEL_VERSION="2024-07-18"

echo "Logging into Azure..."
az login

echo "Setting subscription..."
az account set --subscription $SUBSCRIPTION_ID

echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "Creating OpenAI resource..."
az cognitiveservices account create \
  --name $ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --kind OpenAI \
  --sku S0 \
  --yes

echo "Getting endpoint (resourceName)..."
RESOURCE_NAME=$(az cognitiveservices account show \
  --name $ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --query endpoint \
  | sed 's/https:\/\///' \
  | sed 's/\.openai.azure.com//')

echo "Getting API key..."
API_KEY=$(az cognitiveservices account keys list \
  --name $ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --query key1 \
  --output tsv)

echo "Creating deployment (this takes 2-5 min)..."
az cognitiveservices account deployment create \
  --name $ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP \
  --deployment-name $DEPLOYMENT_NAME \
  --model-name $MODEL_NAME \
  --model-version $MODEL_VERSION \
  --model-format OpenAI \
  --sku-name "Standard" \
  --sku-capacity 1

echo "SUCCESS! Update demo/keys.ts with:"
echo "export const resourceName = \"$RESOURCE_NAME\";"
echo "export const apiKey = \"$API_KEY\";"
echo "export const deploymentName = \"$DEPLOYMENT_NAME\";"
