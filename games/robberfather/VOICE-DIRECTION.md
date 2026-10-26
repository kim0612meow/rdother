# Pursuit voice direction

User feedback, 2026-10-26: Reject friendly calling, greetings and casual Hey recordings. Required tone is an angry, urgent attempt to stop a fleeing thief. Candidate words include Stop!, Stop right there!, and Get back here!, but matching words alone do not establish suitable acting.

Use actual human recordings with verified CC0 licensing. Do not present recording descriptions, tags or successful playback checks as proof of having listened to the performance. Do not substitute speech synthesis, voice cloning, noncommercial-only licenses or cheerful/group chants.

Rejected: Voice_Man_hey_calling_far_away_shout.wav by ValentinPetiteau, Freesound 557375. Friendly calling rather than pursuit. Removed from voice-review.html; was never installed in gameplay.

Research exclusions: Robinhood76's voice shouting stop (Freesound 60521) has Attribution NonCommercial 4.0 restrictions. pyro13djt's Stop It (Freesound 331907) is CC0 but contains a mixture of scared, angry, happy and other takes; no suitable isolated chase performance has been verified, so it is not an approved replacement.

On 2026-10-26 the owner supplied two recordings and explicitly requested installation. The victim detection line is Hey, stop!; the bystander witness line is What are you doing?. They are installed in assets/audio-v41/ with project-specific permission, not a CC0 dedication. Speech triggers once per detection rather than repeating periodically. Previous indoor voice mute remains in effect. Gameplay TTS has been removed; browser TTS voice inventory is available for reference in voice-review.html.

## Lowered owner voices (v42)

The original v41 recordings are preserved. Current v42 playback lowers pitch by 3 semitones with formants and tempo preserved, softens highs above 4.5 kHz, removes rumble below 85 Hz, and reduces voice sample gain from 0.65 to 0.40. Event routing and voice-volume settings remain unchanged.

## Original pitch restored (v43)

The owner rejected the v42 pitch processing as unnatural. Gameplay and review now use the preserved v41 recordings with original pitch, timbre and tempo. Only the quieter playback gain of 0.40 is retained (previously 0.65). The rejected v42 files were removed during cleanup; their processing record remains in Git history.
