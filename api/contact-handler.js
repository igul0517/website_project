// Serverless function to handle contact form submissions
export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle GET request - Retrieve contact information
    if (req.method === 'GET') {
        const { unit } = req.query;
        
        // In a real application, this would fetch data from a database
        const mockData = {
            unit: unit,
            owner: "John Doe",
            email: "john@example.com",
            phone: "0400 000 000"
        };

        // Successful response
        return res.status(200).json(mockData);
    }

    // Handle POST request - Submit contact form
    if (req.method === 'POST') {
        try {
            const { name, unit, email, subject, message } = req.body;

            // Validate required fields
            if (!name || !unit || !email || !subject || !message) {
                return res.status(400).json({
                    error: 'Missing required fields'
                });
            }

            // In a real application, this would save to a database
            // For demo purposes, we'll just return a success response
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Successful submission
            return res.status(201).json({
                success: true,
                message: 'Contact form submitted successfully',
                redirectTo: '/pages/thank-you.html'
            });
        } catch (error) {
            // Server error
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    // Handle unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
}
