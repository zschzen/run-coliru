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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const emojis = ["😠", "😕", "😐", "🙂", "😍"]

const messages = [
  "Your insights would be most logical. How did your experience align with expectations?",
  "Survival is in the details. How was your journey with us?",
  "Your quest isn’t complete yet. How did you find your adventure?",
  "The truth lies in the player’s hands. What was your experience with our world?",
  "What have you done... and how did it feel? Share your thoughts.",
  "In these lands, every action has weight. How did your story unfold?",
  "Every step matters. How did you survive this experience?",
  "Your mission is clear. Was your journey to feedback complete?",
  "A new path lies ahead. What was your last save point like?",
  "Our world evolves with each player. What did you contribute?",
];

const EmojiRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
  return (
    <div className="flex justify-center space-x-4">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => setRating(index + 1)}
          className={`text-3xl transition-transform hover:scale-110 ${
            index + 1 === rating ? "scale-125" : "opacity-50 hover:opacity-100"
          }`}
          aria-label={`Rate ${index + 1} out of 5`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [randomMessage, setRandomMessage] = useState(messages[0])

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * messages.length)
      setRandomMessage(messages[randomIndex])
    }
  }, [isOpen])

  interface FeedbackResponse {
    success: boolean;
    error?: string;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
  
    const response = await fetch('https://run-coliru-feedback.glitch.me/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating, comment }),
    }).catch(() => null);
  
    if (!response) {
      toast({
        title: "Connection Interrupted",
        description: "Looks like we lost contact with the mothership. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
  
    const data = await response.json().catch(() => ({ success: false })) as FeedbackResponse;
  
    if (response.ok && data.success) {
      toast({
        title: "Feedback Accepted",
        description: "Your words carry weight. We will use them wisely.",
        variant: "default",
      });
      setIsOpen(false);
      setRating(0);
      setComment("");
    } else {
      toast({
        title: "Transmission Failed",
        description: data.error || "Something went wrong. Try sending your message again.",
        variant: "destructive",
      });
    }
  
    setIsSubmitting(false);
  };  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-[#262626] border-[#393939] hover:bg-[#393939] text-[#c6c6c6] hover:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share your feedback</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px] bg-[#262626] text-[#f4f4f4] border border-[#393939]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription className="text-[#c6c6c6]">
            {randomMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <EmojiRating rating={rating} setRating={setRating} />
          <Textarea
            placeholder={messages[Math.floor(Math.random() * messages.length)]}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-24 resize-none bg-[#393939] border-[#525252] text-[#f4f4f4]"
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="bg-[#0f62fe] hover:bg-[#0353e9] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
