package cerebras

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client represents Cerebras API client
type Client struct {
	baseURL    string
	apiKey     string
	model      string // Default model name
	httpClient *http.Client
}

// NewClient creates a new Cerebras API client
func NewClient(baseURL, apiKey, model string) *Client {
	if baseURL == "" {
		baseURL = "https://api.cerebras.ai"
	}
	if model == "" {
		model = "llama-3.1-8b" // Default model
	}
	return &Client{
		baseURL: baseURL,
		apiKey:  apiKey,
		model:   model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second, // Increased timeout for longer responses
		},
	}
}

// GenerateRequest represents request to Cerebras API
type GenerateRequest struct {
	Prompt      string  `json:"prompt"`
	Model       string  `json:"model,omitempty"` // Model name (e.g., "llama-3.1-8b")
	MaxTokens   int     `json:"max_tokens,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
	TopP        float64 `json:"top_p,omitempty"`
}

// GenerateResponse represents response from Cerebras API
type GenerateResponse struct {
	Text   string `json:"text"`
	Tokens int    `json:"tokens,omitempty"`
}

// ChatMessage represents a chat message
type ChatMessage struct {
	Role    string `json:"role"` // "user" or "assistant"
	Content string `json:"content"`
}

// ChatRequest represents chat request
type ChatRequest struct {
	Messages    []ChatMessage `json:"messages"`
	Model       string        `json:"model,omitempty"` // Model name (e.g., "llama-3.1-8b")
	MaxTokens   int           `json:"max_tokens,omitempty"`
	Temperature float64       `json:"temperature,omitempty"`
}

// ChatResponse represents chat response
type ChatResponse struct {
	Message ChatMessage `json:"message"`
	Tokens  int         `json:"tokens,omitempty"`
}

// Generate generates text using Cerebras API
func (c *Client) Generate(req *GenerateRequest) (*GenerateResponse, error) {
	// Set defaults
	if req.MaxTokens == 0 {
		req.MaxTokens = 500
	}
	if req.Temperature == 0 {
		req.Temperature = 0.7
	}

	// Set default model if not provided
	model := req.Model
	if model == "" {
		model = c.model
	}

	// Build request body
	requestBody := map[string]interface{}{
		"model":       model,
		"prompt":      req.Prompt,
		"max_tokens":  req.MaxTokens,
		"temperature": req.Temperature,
	}
	if req.TopP > 0 {
		requestBody["top_p"] = req.TopP
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", fmt.Sprintf("%s/v1/completions", c.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
	}

	// Make request
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s (status: %d)", string(body), resp.StatusCode)
	}

	// Parse response
	var apiResponse struct {
		Choices []struct {
			Text string `json:"text"`
		} `json:"choices"`
		Usage struct {
			TotalTokens int `json:"total_tokens"`
		} `json:"usage"`
	}

	if err := json.Unmarshal(body, &apiResponse); err != nil {
		// If response format is different, try to extract text directly
		var simpleResponse struct {
			Text string `json:"text"`
		}
		if err2 := json.Unmarshal(body, &simpleResponse); err2 == nil {
			return &GenerateResponse{
				Text:   simpleResponse.Text,
				Tokens: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if len(apiResponse.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	return &GenerateResponse{
		Text:   apiResponse.Choices[0].Text,
		Tokens: apiResponse.Usage.TotalTokens,
	}, nil
}

// Chat sends chat messages to Cerebras API
func (c *Client) Chat(req *ChatRequest) (*ChatResponse, error) {
	// Set defaults
	if req.MaxTokens == 0 {
		req.MaxTokens = 2000 // Increased default for longer responses
	}
	if req.Temperature == 0 {
		req.Temperature = 0.7
	}

	url := fmt.Sprintf("%s/v1/chat/completions", c.baseURL)
	
	// Set default model if not provided
	model := req.Model
	if model == "" {
		model = c.model
	}

	// Build request body
	requestBody := map[string]interface{}{
		"model":       model,
		"messages":    req.Messages,
		"max_tokens":  req.MaxTokens,
		"temperature": req.Temperature,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
	}

	// Make request
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Log response for debugging (first 1000 chars)
	bodyStr := string(body)
	if len(bodyStr) > 1000 {
		fmt.Printf("=== CEREBRAS API RESPONSE DEBUG ===\n")
		fmt.Printf("Response length: %d bytes\n", len(body))
		fmt.Printf("Response preview (first 1000 chars): %s\n", bodyStr[:1000])
		fmt.Printf("Response preview (last 500 chars): %s\n", bodyStr[len(bodyStr)-500:])
		fmt.Printf("===================================\n")
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		// Try to parse error response for better error messages
		var errorResponse struct {
			Error struct {
				Message string `json:"message"`
				Type    string `json:"type"`
				Code    string `json:"code"`
			} `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResponse); err == nil && errorResponse.Error.Message != "" {
			return nil, fmt.Errorf("Cerebras API error (status %d): %s", resp.StatusCode, errorResponse.Error.Message)
		}
		return nil, fmt.Errorf("Cerebras API error (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse response
	var apiResponse struct {
		Choices []struct {
			Message      ChatMessage `json:"message"`
			FinishReason string      `json:"finish_reason"` // "stop", "length", "content_filter"
		} `json:"choices"`
		Usage struct {
			TotalTokens int `json:"total_tokens"`
		} `json:"usage"`
	}

	if err := json.Unmarshal(body, &apiResponse); err != nil {
		// If response format is different, try alternative format
		var simpleResponse struct {
			Message string `json:"message"`
		}
		if err2 := json.Unmarshal(body, &simpleResponse); err2 == nil {
			return &ChatResponse{
				Message: ChatMessage{
					Role:    "assistant",
					Content: simpleResponse.Message,
				},
				Tokens: 0,
			}, nil
		}
		return nil, fmt.Errorf("failed to parse response: %w, body: %s", err, string(body))
	}

	if len(apiResponse.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	// Check if response was truncated due to token limit
	messageContent := apiResponse.Choices[0].Message.Content
	finishReason := apiResponse.Choices[0].FinishReason
	
	// Log finish reason for debugging
	if finishReason != "" {
		fmt.Printf("=== CEREBRAS FINISH REASON ===\n")
		fmt.Printf("Finish reason: %s\n", finishReason)
		fmt.Printf("Message length: %d characters\n", len(messageContent))
		fmt.Printf("Tokens used: %d\n", apiResponse.Usage.TotalTokens)
		fmt.Printf("=============================\n")
	}
	
	// If response was truncated (finish_reason == "length"), add warning
	if finishReason == "length" {
		messageContent += "\n\n⚠️ *Catatan: Response mungkin terpotong karena mencapai batas token. Silakan coba pertanyaan yang lebih spesifik atau minta data dalam batch yang lebih kecil, atau gunakan model yang lebih advanced*"
	}

	return &ChatResponse{
		Message: ChatMessage{
			Role:    apiResponse.Choices[0].Message.Role,
			Content: messageContent,
		},
		Tokens: apiResponse.Usage.TotalTokens,
	}, nil
}

