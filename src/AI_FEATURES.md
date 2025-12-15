# PCI Engine - AI Integration Features

## Overview
The PCI Engine now includes comprehensive AI-powered features that enhance the effectiveness of project cost modeling through intelligent automation, anomaly detection, and real-time insights.

## AI Features

### 1. **AI Assistant (Floating Chat)**
- **Location**: Bottom-right floating button with sparkles icon
- **Capabilities**:
  - Conversational interface for cost analysis questions
  - Task portfolio analysis and recommendations
  - Anomaly detection across all tasks
  - Cost optimization suggestions
  - Industry benchmark comparisons
- **Quick Actions**:
  - Analyze Tasks
  - Find Anomalies
  - Optimize Costs

### 2. **AI Task Creator (Natural Language Input)**
- **Location**: "AI Task Creator" button in dashboard header
- **How it works**:
  1. Describe your task in plain language
  2. AI analyzes the description for complexity indicators
  3. Automatically suggests all 11 PCI factors
  4. Provides AI-verified units with confidence scoring
- **Keyword Detection**:
  - **Complexity**: "complex", "advanced", "sophisticated" → increases ISR, CF, AEP
  - **Integration**: "integration", "API", "third-party" → increases RCF, AEP, RF, CGW
  - **Security**: "security", "authentication", "encryption" → increases RCF, S, GLRI
  - **Payment**: "payment", "checkout", "transaction" → increases RCF, S, GLRI
  - **UI/UX**: "UI", "interface", "dashboard", "responsive" → increases UXI, ISR
  - **Analytics**: "analytics", "reporting", "charts" → increases AEP, CF, MLW
  - **Real-time**: "real-time", "live", "websocket" → increases AEP, CF, S, RCF
  - **AI/ML**: "AI", "machine learning" → increases S, CF, AEP, RCF

### 3. **AI Auto-Fill (Per Row)**
- **Location**: Sparkles icon column in task table (✨)
- **Functionality**:
  - Click the sparkles button on any task row
  - AI analyzes the task name and auto-fills all 11 PCI factors
  - Shows loading animation during processing
  - Uses the same intelligent analysis as AI Task Creator

### 4. **AI Insights Card**
- **Location**: Between task table and summary section
- **Real-time Intelligence**:
  - AAS score health monitoring
  - Cost efficiency analysis
  - Risk factor detection
  - Specialization needs assessment
  - Overall project health scoring
- **Insight Types**:
  - ✅ **Success**: Healthy scores, good calibration
  - ⚠️ **Warning**: Low AAS, high risk factors
  - ℹ️ **Info**: Cost patterns, specialization needs

## AI Analysis Logic

### Factor Estimation
The AI uses keyword-based heuristics to estimate PCI factors:

**Base Values** (starting point):
- ISR: 3
- CF: 1.2
- UXI: 1.2
- RCF: 1.2
- AEP: 5
- L: 1
- MLW: 1.2
- CGW: 1.1
- RF: 1.1
- S: 1.1
- GLRI: 1.1

**Adjustments** applied based on task description keywords.

### AI Verified Units Calculation
```
PCI = (ISR × CF × UXI) + (RCF × AEP - L) + (MLW × CGW × RF) + (S × GLRI)
AI Verified Units = PCI × (0.9 to 1.0) // 90-100% confidence range
```

### Anomaly Detection
- Tasks with PCI > 2× average are flagged as high complexity
- Tasks with PCI < 0.3× average are flagged as potentially underestimated
- AAS scores below 85% trigger warnings

## Best Practices

1. **Use Natural Language**: Describe tasks comprehensively for better AI analysis
2. **Review AI Suggestions**: Always validate AI-generated factors against your domain knowledge
3. **Iterate with Assistant**: Ask the AI assistant for explanations or alternative suggestions
4. **Monitor Insights**: Check the AI Insights card regularly for project health indicators
5. **Combine Methods**: Use both manual entry and AI suggestions for optimal accuracy

## Future Enhancements (Backend Integration)

With a Supabase backend, these features could be enhanced:

- **Historical Learning**: AI learns from your past projects
- **Team Benchmarking**: Compare against industry and team averages
- **Predictive Analytics**: Forecast project risks and timelines
- **Collaborative Intelligence**: Share insights across team members
- **Audit Trails**: Track all AI suggestions and user modifications
- **Custom ML Models**: Train models on your organization's specific data

## Technical Architecture

- **Frontend-Only Implementation**: Currently uses mock AI logic for demonstration
- **Keyword-Based Analysis**: Uses pattern matching on task descriptions
- **Real-time Updates**: All insights update automatically as tasks change
- **Responsive Design**: All AI components work across desktop and mobile devices
