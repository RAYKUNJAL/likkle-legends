# Deploying Your Voice AI Server

The Voice AI (PersonaPlex/Moshi) model requires a GPU (Graphics Card) to run efficiently. Because of this, it **cannot** run on:
- ❌ **Supabase** (Supabase is for database/auth, not heavy AI processing).
- ❌ **Vercel** (Vercel is for frontend/websites, not persistent AI servers).

However, it **CAN** run on **Google Cloud**, but you need a specific setup.

## Option 1: Google Cloud Compute Engine (Recommended for Control)

This is like renting a powerful computer in the cloud.

1.  **Create a VM Instance:**
    *   Go to Google Cloud Console -> Compute Engine.
    *   Create a new instance.
    *   **Machine Type:** Select a GPU-optimized machine (e.g., `g2-standard-4` which comes with an NVIDIA L4 GPU, or `n1-standard-4` with an NVIDIA T4 attached).
    *   **Boot Disk:** Select "Deep Learning One Image" (it comes with drivers pre-installed) or Ubuntu 22.04.
    *   **Firewall:** Allow HTTP/HTTPS and create a firewall rule to allow TCP port `8998` (or 443 if using HTTPS).

2.  **Install & Run:**
    SSH into your new VM and run:
    ```bash
    # Install Python & Pip
    sudo apt update && sudo apt install -y python3-pip ffmpeg git

    # Install Moshi/PersonaPlex
    pip install git+https://github.com/kyutai-labs/moshi.git

    # Login to HuggingFace (to get the model model)
    pip install huggingface_hub
    export HF_TOKEN="your_hugging_face_token_here"

    # Run the Server
    python -m moshi.server --host 0.0.0.0 --port 8998
    ```

3.  **Connect:**
    Update `app/voice-demo/page.tsx` with your VM's External IP:
    ```tsx
    serverUrl="ws://<YOUR_VM_IP>:8998"
    ```

---

## Option 2: RunPod / Lambda Labs (Cheaper & Easier)

These protocols are specifically built for hosting AI models and are often cheaper than Google Cloud.

1.  Create an account on [RunPod.io](https://runpod.io).
2.  Deploy a "Secure Cloud" GPU pod (e.g., NVIDIA RTX 3090 or 4090).
3.  Use the `pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime` image.
4.  In the "Edit Environment" settings, expose port `8998`.
5.  SSH/Terminal into the pod and run the same install commands as above.

## Why not Google Cloud Run?

Google Cloud Run is great (serverless containers), but it currently has limited/preview support for GPUs. Running this model on a CPU (the default) would result in 5-10 second delays between speaking and hearing a response, breaking the "real-time" illusion.

## Summary Checklist

- [ ] **Account**: Sign up for Google Cloud or RunPod.
- [ ] **GPU**: Ensure you rent a machine with at least **16GB VRAM** (NVIDIA T4, L4, A10g, or RTX 3090/4090).
- [ ] **Token**: Get a [Hugging Face Access Token](https://huggingface.co/settings/tokens) to download the PersonaPlex weights.
- [ ] **Deploy**: Run the server command.
- [ ] **Update Frontend**: Point your Likkle Legends website to the new server IP.
