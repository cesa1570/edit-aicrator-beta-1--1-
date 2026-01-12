import firebase_admin
from firebase_admin import credentials, firestore, storage
import time
import os
import requests
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip, TextClip, ColorClip

# Initialize Firebase Admin
# NOTE: Ensure you have your serviceAccountKey.json in the same directory or set env vars
cred = credentials.Certificate('serviceAccountKey.json') 
firebase_admin.initialize_app(cred, {
    'storageBucket': 'YOUR_STORAGE_BUCKET_NAME.appspot.com' 
})

db = firestore.client()
bucket = storage.bucket()

def process_job(job_id, job_data):
    print(f"Processing Job {job_id}...")
    
    # Update status to processing
    db.collection('render_queue').document(job_id).update({
        'status': 'processing',
        'progress': 10
    })

    try:
        project = job_data.get('projectData')
        scenes = project.get('script', {}).get('scenes', [])
        
        clips = []
        
        # Download Assets & Create Clips
        for i, scene in enumerate(scenes):
            print(f"Processing scene {i+1}/{len(scenes)}")
            
            image_url = scene.get('imageUrl')
            audio_url = scene.get('videoUrl') # Assuming voiceover is stored here or separate field? 
            # In ShortsCreator, audioUrl is not explicitly stored in scene, it relies on client-side decoding.
            # However, cloud sync should have uploaded it. 
            # Let's assume 'audioUrl' exists in the scene data synced to Firestore.
            
            # NOTE: For this to work, ShortsCreator MUST ensure audioUrl is in the scene data.
            # If not, we might need to rely on re-generating or finding the asset.
            
            # Mocking download for demonstration
            # img_data = requests.get(image_url).content
            # with open(f'temp_img_{i}.jpg', 'wb') as f: f.write(img_data)
            
            # clip = ImageClip(f'temp_img_{i}.jpg').set_duration(3)
            # clips.append(clip)
            pass

        # Simulate Rendering Time
        time.sleep(5)
        
        # Update Progress
        db.collection('render_queue').document(job_id).update({'progress': 50})
        time.sleep(5)
        
        # Mock Upload Result
        # blob = bucket.blob(f"renders/{job_id}.mp4")
        # blob.upload_from_filename("final_output.mp4")
        # blob.make_public()
        # video_url = blob.public_url
        
        video_url = "https://www.w3schools.com/html/mov_bbb.mp4" # Mock Result

        # Complete
        db.collection('render_queue').document(job_id).update({
            'status': 'completed',
            'progress': 100,
            'videoUrl': video_url
        })
        print(f"Job {job_id} Completed!")

    except Exception as e:
        print(f"Job {job_id} Failed: {e}")
        db.collection('render_queue').document(job_id).update({
            'status': 'failed',
            'error': str(e)
        })

def listen_loop():
    print("Listening for render jobs...")
    
    # Create valid callback
    def on_snapshot(col_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == 'ADDED':
                job = change.document.to_dict()
                if job.get('status') == 'pending':
                    process_job(change.document.id, job)

    col_query = db.collection('render_queue').where('status', '==', 'pending')
    query_watch = col_query.on_snapshot(on_snapshot)

    while True:
        time.sleep(1)

if __name__ == '__main__':
    listen_loop()
