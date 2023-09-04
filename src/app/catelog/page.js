import Link from "next/link";

export default function CatelogList() {
    return ( 
     <div style={{display: "flex", flexDirection:"column"}}>
            <Link href="/catelog/01deg_jra55v13_ryf9091">01deg_jra55v13_ryf9091</Link>
            <Link href="/catelog/025deg_jra55_iaf_omip2_cycle6">025deg_jra55_iaf_omip2_cycle6</Link>
            <Link href="/catelog/01deg_jra55v140_iaf_cycle4">01deg_jra55v140_iaf_cycle4</Link>
            <Link href="/catelog/025deg_jra55_iaf_omip2_cycle6">025deg_jra55_iaf_omip2_cycle6</Link>
     </div>
    )
  }