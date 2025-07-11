import { getTechLogos, cn } from '@/lib/utils'
import React from 'react'
import Image from 'next/image';


const DisplayTechIcons = async ({techStack}: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className={cn("flex flex-row gap-2")}>
      {techIcons.slice(0, 3).map(({tech, url}) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex-center",
            "hover:bg-dark-200 transition-colors duration-200",
            "border border-transparent hover:border-primary-200/20"
          )}
        >
          <span className={cn("tech-tooltip", "whitespace-nowrap")}>{tech}</span>
          <Image
            src={url}
            alt={tech}
            width={20}
            height={20}
            className={cn("size-5", "object-contain")}
          />
        </div>
      ))}
      {techStack.length > 3 && (
        <div
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex-center",
            "hover:bg-dark-200 transition-colors duration-200",
            "border border-transparent hover:border-primary-200/20"
          )}
        >
          <span className={cn("tech-tooltip", "whitespace-nowrap")}>
            +{techStack.length - 3} more
          </span>
          <span className={cn("text-xs text-gray-400", "font-medium")}>
            +{techStack.length - 3}
          </span>
        </div>
      )}
    </div>
  )
}

export default DisplayTechIcons
