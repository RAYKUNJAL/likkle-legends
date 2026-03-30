import { NextRequest, NextResponse } from 'next/server';

interface Deployment {
  id: string;
  timestamp: string;
  status: 'success' | 'in-progress' | 'failed';
  version: string;
  files: number;
  branch: string;
}

// In-memory store for demo purposes
let deployments: Deployment[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        deployments: deployments.slice(-10), // Last 10 deployments
        lastDeployment: deployments[deployments.length - 1] || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Deployments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { branch, version } = await request.json();

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch is required' },
        { status: 400 }
      );
    }

    // Create deployment
    const deployment: Deployment = {
      id: `deploy-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'in-progress',
      version: version || 'v1.0.0',
      files: 14,
      branch,
    };

    deployments.push(deployment);

    // Simulate deployment completion after 5 seconds
    setTimeout(() => {
      const idx = deployments.findIndex((d) => d.id === deployment.id);
      if (idx !== -1) {
        deployments[idx].status = 'success';
      }
    }, 5000);

    return NextResponse.json(
      {
        success: true,
        deploymentId: deployment.id,
        message: 'Deployment started',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Deployment creation error:', error);
    return NextResponse.json(
      { error: 'Deployment creation failed' },
      { status: 500 }
    );
  }
}
