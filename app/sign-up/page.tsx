import { SignUp } from "@clerk/nextjs";
import { Nav } from "@/components/nav";

export default function SignUpPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="flex justify-center pt-16 pb-20">
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-[rgba(26,24,20,0.06)] rounded-[20px]",
            },
          }}
        />
      </div>
    </div>
  );
}
