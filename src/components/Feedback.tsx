"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const emojis = [
  { emoji: "😠", label: "Hate it" },
  { emoji: "😕", label: "Dislike it" },
  { emoji: "😐", label: "It's okay" },
  { emoji: "🙂", label: "Like it" },
  { emoji: "😍", label: "Love it" }
]

const messages = [
  "How did your experience align with expectations?",
  "Share your thoughts on your journey with us.",
  "What stood out in your adventure?",
  "How did our world resonate with you?",
  "What emotions did your experience evoke?",
  "How did your story unfold in our realm?",
  "What challenges did you face?",
  "Was your quest for feedback fulfilling?",
  "What new perspectives did you gain?",
  "How did you shape our evolving world?",
];

const EmojiRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
  return (
    <div className="flex justify-between w-full mb-6">
      {emojis.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setRating(index + 1)}
                className={`text-3xl sm:text-4xl transition-all ease-in-out hover:scale-110 ${
                  index + 1 === rating ? "scale-125" : "opacity-50 hover:opacity-100"
                }`}
                aria-label={`Rate ${index + 1} out of 5`}
              >
                {item.emoji}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#333] text-[#e0e0e0] border-[#4a4a4a]">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [randomMessage, setRandomMessage] = useState(messages[0]);

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * messages.length)
      setRandomMessage(messages[randomIndex])

    } else {
      setRating(0);
      setComment("");
    }
  }, [isOpen])

  interface FeedbackResponse {
    success: boolean;
    error?: string;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
  
    try {
      const response = await fetch('https://run-coliru-feedback.glitch.me/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json() as FeedbackResponse;
        if (data.success) {
          toast({
            title: "Feedback Received",
            description: "Thank you for shaping our world.",
            variant: "default",
          });
          setIsOpen(false);
        } else {
          throw new Error(data.error || "Submission failed");
        }
      } else {
        toast({
          title: "Feedback Received",
          description: "Thank you for shaping our world.",
          variant: "default",
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Transmission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-[#1a1a1a] border-[#333] hover:bg-[#333] text-[#e0e0e0] hover:text-white transition-colors duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share your thoughts</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[500px] w-11/12 max-w-lg mx-auto bg-[#1a1a1a] text-[#e0e0e0] border border-[#333] shadow-lg rounded-lg">
        <DialogHeader className="border-b border-[#333] pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#0f62fe]">Your Voice Matters</DialogTitle>
          <DialogDescription className="text-[#b0b0b0] text-sm sm:text-base mt-2">
            {randomMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="relative h-16">
            <EmojiRating rating={rating} setRating={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            autoFocus={true}
            onChange={(e) => setComment(e.target.value)}
            className="h-32 resize-none bg-[#262626] border-[#404040] text-[#e0e0e0] text-sm sm:text-base focus:ring-[#0f62fe] focus:border-[#0f62fe] transition-colors duration-300"
          />
        </div>
        <DialogFooter className="border-t border-[#333] pt-4">
          <Button
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="bg-[#0f62fe] hover:bg-[#0353e9] text-white w-full py-2 rounded-md transition-colors duration-300"
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
