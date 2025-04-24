import Image from "next/image";
import loader from "@/assets/loader.gif";

type LoadingProps = {
  size?: number;
};

const Loading: React.FC<LoadingProps> = ({ size = 80 }) => {
  return (
    <div className="flex flex-row p-5 items-center justify-center">
      <Image
        src={loader}
        height={size}
        width={size}
        alt="Loading..."
        priority={true}
        style={{ height: `${size}px`, width: "auto" }}
        unoptimized
      />
    </div>
  );
};

export default Loading;
