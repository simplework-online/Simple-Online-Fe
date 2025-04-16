import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useFirebase } from "@/context/useFirebase";
import { Clock, Star, Monitor, Figma, BookOpen, Gamepad2 } from "lucide-react"
import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function GigCardMessage() {
    const { allGigs } = useSelector((state) => state?.gig);
    const { selectedUser } = useFirebase();

    const defaultGigData = {
        _id: "67b759e39867fa427b221306",
        title: "Mollit non consequat Exercitationem dolores",
        category: "content writing",
        subcategory: "Blog Posts",
        servicesImages: [
            {
                imgUrl: "https://res.cloudinary.com/di9sthase/image/upload/v1740069385/ServiceImages/cdub65sfzvcmmymwcluy.png",
                publicId: "ServiceImages/cdub65sfzvcmmymwcluy",
            },
        ],
        pricing: {
            basic: {
                delivery: "15+ Days",
                price: 872,
            },
            standard: {
                delivery: "15+ Days",
                price: 274,
            },
            premium: {
                delivery: "8-14 Days",
                price: 654,
            },
        },
        metaData: {
            appTool: ["Games"],
            designTool: ["Marvel", "Figma", "Adobe XD"],
            device: ["Books", "Games"],
        },
        sales: 0,
        rating: 0,
    };

    const gigData = useMemo(() => {
        if (selectedUser?._id && Array.isArray(allGigs) || selectedUser?.id && Array.isArray(allGigs)) {
            const foundGig = allGigs.find(gig => gig.user_id === selectedUser._id || gig.user_id === selectedUser.id);

            return foundGig || null; // Return null if no match found for the selected user
        } else {
            return defaultGigData;
        }
    }, [selectedUser, allGigs]);


    // Get the first image for display
    const mainImage = gigData.servicesImages ? gigData?.servicesImages[0]?.imgUrl : 'https://asset.cloudinary.com/dtro0xcp7/66b76912505dbf5bc04c9e46fb75454e'
    console.log('gig data used', gigData)

    // Calculate the starting price (lowest of the three packages)
    const startingPrice = Math.min(
        gigData.pricing?.basic?.price,
        gigData.pricing?.standard?.price,
        gigData.pricing?.premium?.price,
    )

    // Get the fastest delivery time
    const deliveryTimes = [
        gigData.pricing?.basic?.delivery,
        gigData.pricing?.standard?.delivery,
        gigData.pricing?.premium?.delivery,
    ]
    const fastestDelivery = deliveryTimes.includes("8-14 Days") ? "8-14 Days" : "15+ Days"

    // Render icons based on metadata
    const renderMetadataIcons = () => {
        const icons = []

        if (gigData.metaData?.designTool.includes("Figma")) {
            icons.push(<Figma key="figma" className="h-4 w-4 text-[#94A3B8]" />)
        }

        if (gigData.metaData?.device.includes("Books")) {
            icons.push(<BookOpen key="book" className="h-4 w-4 text-[#94A3B8]" />)
        }

        if (gigData.metaData?.appTool.includes("Games") || gigData.metaData.device.includes("Games")) {
            icons.push(<Gamepad2 key="games" className="h-4 w-4 text-[#94A3B8]" />)
        }

        return icons
    }

    return (
        <Card className="w-[311px] h-[342px] overflow-hidden flex flex-col bg-[#1E293B] text-[#F1F5F9]
               shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
            {/* Image Section */}
            <div className="relative h-[160px] w-full overflow-hidden"> {/* Optional: Add overflow-hidden if using rounded corners */}
                {mainImage ? (
                    <> {/* Use Fragment to group image and overlay */}
                        <img
                            src={mainImage || "/placeholder.svg"}
                            alt={gigData?.title || 'Gig image'} // Added fallback for alt text
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Vignette Overlay Div */}
                        <div
                            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_65%,rgba(0,0,0,0.65)_100%)]"
                            aria-hidden="true" // Good practice for decorative overlays
                        ></div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        {/* Make sure Monitor component/icon is imported */}
                        {/* <Monitor className="h-8 w-8 text-white" />  */}
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Placeholder SVG */}
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-xs font-normal text-[#E2E8F0] border-[#475569]">
                        {gigData.category}
                    </Badge>
                    <div className="flex items-center text-xs">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{gigData.rating > 0 ? gigData.rating.toFixed(1) : "New"}</span>
                    </div>
                </div>
                <h3 className="text-sm font-medium line-clamp-2 mt-1 h-10">{gigData.title}</h3>
            </CardHeader>

            <CardContent className="p-3 pt-0 flex-grow">
                <div className="flex items-center text-xs text-[#CBD5E1] mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Delivery in {fastestDelivery}</span>
                </div>

                <div className="flex gap-2 mt-2">{renderMetadataIcons()}</div>
            </CardContent>

            <CardFooter className="p-3 pt-0 border-t border-[#334155] flex justify-between items-center">
                <div className="text-xs text-[#CBD5E1]">{gigData.sales > 0 ? `${gigData.sales} sales` : "No sales yet"}</div>
                <div className="text-right">
                    <p className="text-xs text-[#CBD5E1]">Starting at</p>
                    <p className="font-semibold text-[#F8FAFC]">${startingPrice}</p>
                </div>
            </CardFooter>
        </Card>
    )
}
