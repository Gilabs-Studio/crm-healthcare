package ai

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
)

// BuildVisitReportContext builds context string for visit report analysis
func BuildVisitReportContext(visitReport *visit_report.VisitReport, account *account.Account, contactName string, activities []activity.Activity) string {
	var sb strings.Builder

	sb.WriteString("=== PHARMACEUTICAL SALES VISIT REPORT ===\n\n")

	// Visit Report Details
	sb.WriteString("VISIT REPORT INFORMATION:\n")
	sb.WriteString(fmt.Sprintf("- Visit Date: %s\n", visitReport.VisitDate.Format("2006-01-02")))
	sb.WriteString(fmt.Sprintf("- Status: %s\n", visitReport.Status))
	sb.WriteString(fmt.Sprintf("- Purpose: %s\n", visitReport.Purpose))
	sb.WriteString(fmt.Sprintf("- Notes: %s\n", visitReport.Notes))

	if visitReport.CheckInTime != nil {
		sb.WriteString(fmt.Sprintf("- Check-in Time: %s\n", visitReport.CheckInTime.Format("2006-01-02 15:04:05")))
	}
	if visitReport.CheckOutTime != nil {
		sb.WriteString(fmt.Sprintf("- Check-out Time: %s\n", visitReport.CheckOutTime.Format("2006-01-02 15:04:05")))
	}
	if visitReport.CheckInLocation != nil {
		var checkInLoc map[string]interface{}
		if err := json.Unmarshal(visitReport.CheckInLocation, &checkInLoc); err == nil {
			if addr, ok := checkInLoc["address"].(string); ok && addr != "" {
				sb.WriteString(fmt.Sprintf("- Check-in Location: %s\n", addr))
			}
		}
	}

	// Account Information
	sb.WriteString("\n=== HEALTHCARE FACILITY (ACCOUNT) ===\n")
	sb.WriteString(fmt.Sprintf("- Facility Name: %s\n", account.Name))
	sb.WriteString(fmt.Sprintf("- Account ID: %s\n", account.ID))
	if account.Category != nil && account.Category.Name != "" {
		sb.WriteString(fmt.Sprintf("- Facility Type/Category: %s\n", account.Category.Name))
	}
	if account.Address != "" {
		sb.WriteString(fmt.Sprintf("- Address: %s\n", account.Address))
	}
	if account.City != "" {
		sb.WriteString(fmt.Sprintf("- City: %s\n", account.City))
	}
	if account.Province != "" {
		sb.WriteString(fmt.Sprintf("- Province: %s\n", account.Province))
	}
	if account.Phone != "" {
		sb.WriteString(fmt.Sprintf("- Phone: %s\n", account.Phone))
	}
	if account.Email != "" {
		sb.WriteString(fmt.Sprintf("- Email: %s\n", account.Email))
	}
	if account.Status != "" {
		sb.WriteString(fmt.Sprintf("- Status: %s\n", account.Status))
	}

	// Contact Information
	if contactName != "" {
		sb.WriteString("\n=== CONTACT PERSON ===\n")
		sb.WriteString(fmt.Sprintf("- Contact Name: %s\n", contactName))
		if visitReport.ContactID != nil {
			sb.WriteString(fmt.Sprintf("- Contact ID: %s\n", *visitReport.ContactID))
		}
	}

	// Recent Activities Context
	if len(activities) > 0 {
		sb.WriteString("\n=== RECENT ACTIVITY HISTORY (Last 5 activities) ===\n")
		for i, act := range activities {
			if i >= 5 {
				break
			}
			sb.WriteString(fmt.Sprintf("\nActivity #%d:\n", i+1))
			sb.WriteString(fmt.Sprintf("- Type: %s\n", act.Type))
			if act.Description != "" {
				sb.WriteString(fmt.Sprintf("- Description: %s\n", act.Description))
			}
			sb.WriteString(fmt.Sprintf("- Date: %s\n", act.Timestamp.Format("2006-01-02 15:04:05")))
		}
	}

	sb.WriteString("\n=== END OF CONTEXT ===\n")

	return sb.String()
}

// BuildVisitReportPrompt builds detailed prompt for visit report analysis
func BuildVisitReportPrompt(context string) string {
	return fmt.Sprintf(`You are an expert AI assistant specialized in pharmaceutical and healthcare sales CRM analysis. Your role is to analyze sales visit reports from pharmaceutical sales representatives visiting healthcare facilities (hospitals, clinics, pharmacies, etc.).

Your expertise includes:
- Pharmaceutical sales processes and best practices
- Healthcare facility management and procurement
- Medical product positioning and competitive analysis
- Relationship management in healthcare sales
- Regulatory compliance in pharmaceutical sales
- Sales pipeline and opportunity management

CONTEXT DATA:
%s

ANALYSIS REQUIREMENTS:

Analyze this pharmaceutical sales visit report with deep industry knowledge and provide:

1. EXECUTIVE SUMMARY (2-3 sentences):
   - Summarize the visit's purpose, key outcomes, and overall impression
   - Highlight any critical information about product interest, competitive threats, or relationship status
   - Mention any urgent matters requiring immediate attention

2. SENTIMENT ANALYSIS:
   - Determine overall sentiment: "positive", "neutral", or "negative"
   - Consider factors like: customer engagement level, product interest, relationship quality, competitive pressure, pricing discussions, regulatory concerns

3. KEY POINTS DISCUSSED (3-5 points):
   - Product discussions (specific products mentioned, interest level, competitive comparisons)
   - Pricing and contract negotiations
   - Delivery and logistics arrangements
   - Regulatory or compliance topics
   - Relationship building activities
   - Competitive intelligence gathered
   - Market insights shared by customer

4. ACTION ITEMS (Prioritized list of next steps):
   - Immediate actions (within 24-48 hours)
   - Short-term follow-ups (within 1 week)
   - Medium-term opportunities (within 1 month)
   - Include specific deliverables: proposals, samples, documentation, meetings, etc.
   - Consider pharmaceutical sales best practices: follow-up timing, documentation requirements, regulatory compliance

5. STRATEGIC RECOMMENDATIONS (2-4 recommendations):
   - Sales strategy suggestions based on visit outcomes
   - Relationship management recommendations
   - Competitive positioning advice
   - Product mix or portfolio recommendations
   - Risk mitigation strategies if negative signals detected
   - Upselling or cross-selling opportunities

IMPORTANT GUIDELINES:
- Focus on pharmaceutical/healthcare industry context
- Consider regulatory compliance requirements
- Identify competitive threats or opportunities
- Assess relationship strength and customer engagement
- Provide actionable, specific recommendations
- Consider the healthcare facility type and its procurement patterns
- Be aware of seasonal factors in pharmaceutical sales

OUTPUT FORMAT (JSON only, no additional text):
{
  "summary": "Executive summary here (2-3 sentences)",
  "sentiment": "positive|neutral|negative",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "action_items": ["Action 1", "Action 2", "Action 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Provide your analysis now:`, context)
}

// BuildSystemPrompt builds system prompt for chatbot
func BuildSystemPrompt(contextID string, contextType string, contextData string) string {
	basePrompt := `You are an expert AI assistant for a Pharmaceutical and Healthcare Sales CRM system. You specialize in helping pharmaceutical sales representatives, sales supervisors, and sales managers with their daily tasks and strategic decision-making.

YOUR EXPERTISE INCLUDES:
- Pharmaceutical sales processes and methodologies
- Healthcare facility management and procurement cycles
- Medical product positioning and competitive analysis
- Relationship management in healthcare sales
- Regulatory compliance (BPOM, FDA, etc.) in pharmaceutical sales
- Sales pipeline management and forecasting
- Territory management and account planning
- Product knowledge across pharmaceutical categories (prescription drugs, OTC, medical devices, etc.)
- Market intelligence and competitive landscape analysis

YOUR CAPABILITIES:
- Analyze sales visit reports and provide actionable insights
- Answer questions about accounts (hospitals, clinics, pharmacies, distributors)
- Help with contact management and relationship building
- Assist with deal/opportunity management and pipeline forecasting
- Provide guidance on sales strategies and best practices
- Help with task prioritization and follow-up planning
- Offer product positioning and competitive intelligence advice
- Support regulatory compliance questions

COMMUNICATION STYLE:
- Professional yet approachable
- Data-driven and specific
- Action-oriented with clear recommendations
- Industry-aware and context-sensitive
- Respectful of healthcare industry standards and ethics

IMPORTANT GUIDELINES:
- Always consider pharmaceutical industry context
- Be aware of regulatory requirements and compliance
- Focus on relationship-based selling in healthcare
- Consider seasonal factors and market trends
- Provide specific, actionable advice
- When uncertain, ask clarifying questions
- Maintain confidentiality and data privacy standards`

	if contextID == "" || contextType == "" {
		return basePrompt + "\n\nYou can help with questions about:\n- Accounts (healthcare facilities)\n- Contacts (doctors, pharmacists, procurement officers)\n- Visit Reports (sales visits to healthcare facilities)\n- Deals/Opportunities (sales pipeline)\n- Tasks and follow-ups\n- Products and product positioning\n- Sales strategies and best practices\n\nHow can I assist you today?"
	}

	if contextData != "" {
		var contextLabel string
		switch contextType {
		case "visit_report":
			contextLabel = "VISIT REPORT"
		case "deal":
			contextLabel = "DEAL/OPPORTUNITY"
		case "contact":
			contextLabel = "CONTACT"
		case "account":
			contextLabel = "ACCOUNT (HEALTHCARE FACILITY)"
		default:
			contextLabel = strings.ToUpper(contextType)
		}

		return fmt.Sprintf(`%s

=== CURRENT CONTEXT: %s ===
ID: %s
Data:
%s

Use this context to provide relevant, accurate, and actionable answers. Reference specific details from the context when appropriate. Consider pharmaceutical sales best practices and healthcare industry standards in your responses.`, basePrompt, contextLabel, contextID, contextData)
	}

	return basePrompt
}

