// import { EDIT_FILENAME_LC_KEY, EDIT_FILE_LC_KEY } from '@/common/constants'
import { useRemoteConfig } from "../../providers/remote-config-provider";
import { useUser } from "../../providers/user-provider";
import { API } from "../../services/api";
import { ApiFile } from "../../services/api/types";
import { generatePDFCover } from "../../use-cases/generate-pdf-cover";
import {
  PaymentPlanId,
  useGetSubscriptionProducts,
} from "../../use-cases/get-subscription-products";
import check from "./assets/check.svg";
import cross from "./assets/cross.svg";
import { useRouter } from "next/router";
import {useEffect, useState,useCallback, useMemo, use} from "react";

export enum PAGE_LINKS {
  MAIN = "/",
  PAYMENT = "/payment",
  DASHBOARD = "/dashboard",
}

export enum InternalFileType {
  DOC = "DOC",
  DOCX = "DOCX",
  JPEG = "JPEG",
  JPG = "JPG",
  HEIC = "HEIC",
  HEIF = "HEIF",
  PDF = "PDF",
  PNG = "PNG",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  ZIP = "ZIP",
  BMP = "BMP",
  EPS = "EPS",
  GIF = "GIF",
  SVG = "SVG",
  TIFF = "TIFF",
  WEBP = "WEBP",
  EPUB = "EPUB",
}

export const imagesFormat = [
  InternalFileType.HEIC,
  InternalFileType.SVG,
  InternalFileType.PNG,
  InternalFileType.BMP,
  InternalFileType.EPS,
  InternalFileType.GIF,
  InternalFileType.TIFF,
  InternalFileType.WEBP,
  InternalFileType.JPG,
  InternalFileType.JPEG,
];

export type Bullets = {
  imgSrc: string;
  bullText: JSX.Element;
};

export interface Plan {
  id: PaymentPlanId;
  title: string;
  price: string;
  date: string | null;
  bullets: Bullets[];
  bulletsC?: Bullets[];
  text: string | JSX.Element;
  formattedCurrency?: string;
  fullPrice?: string;
}

export interface IPaymentPageInteractor {
  selectedPlan: PaymentPlanId;
  onSelectPlan: (plan: PaymentPlanId) => void;
  onContinue: (place?: string) => void;
  onCommentsFlip: () => void;

  imagePDF: Blob | null;
  isImageLoading: boolean;
  fileType: string | null;
  fileLink: string | null;

  isEditorFlow: boolean;
  isSecondEmail: boolean;
  isThirdEmail: boolean;

  isRemoteConfigLoading: boolean;
  fileName: string | null;

  getPlans: (t: (key: string) => string) => Plan[];
  isPlansLoading: boolean;
}



export const usePaymentPageInteractor = (): IPaymentPageInteractor => {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanId>(
    PaymentPlanId.MONTHLY_FULL
  );
  const [file, setFile] = useState<ApiFile>();
  const [imagePDF, setImagePDF] = useState<Blob | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [fileLink, setFileLink] = useState<string | null>(null);

  const router = useRouter();

  const { products } = useGetSubscriptionProducts();

  const { user } = useUser();

  const { abTests, isRemoteConfigLoading } = useRemoteConfig();

  const onCommentsFlip = () => {
    console.log("send event analytic0");
  };

  const onSelectPlan = (plan: PaymentPlanId) => {
    if (selectedPlan === plan) {
      setSelectedPlan(plan);
      onContinue("planTab");

      return;
    }
    setSelectedPlan(plan);
    const product = products?.find((item) => item.name === plan);

    console.log(
      "send event analytic1",
      "productId: ",
      plan,
      "currency: ",
      product?.price?.currency || "USD",
      "value: ",
      (product?.price?.price || 0) / 100
    );
  };

  const onContinue = (place?: string) => {
    console.log(
      "send event analytic2",
      "place: ",
      place ? place : "button",
      "planName: ",
      selectedPlan
    );

    localStorage.setItem("selectedPlan", selectedPlan);

    router.push({ pathname: `${PAGE_LINKS.PAYMENT}`, query: router.query });
  };
 const loadPdfCover = useCallback(async (): Promise<void> => {
    if (!file || file.internal_type !== "PDF") {
      return;
    }

    setIsImageLoading(true);

    try {
      const fileUrl = await (async () => {
        if (router.query?.file) {
          return router.query.editedFile === "true"
            ? API.files
                .editedFile(router.query.file as string)
                .then((r) => r.url)
            : API.files
                .downloadFile(router.query.file as string)
                .then((r) => r.url);
        }

        return API.files.downloadFile(file.id).then((r) => r.url);
      })();

      const pdfCover = await generatePDFCover({
        pdfFileUrl: fileUrl,
        width: 640,
      });
      setImagePDF(pdfCover);
    } finally {
      setIsImageLoading(false);
    }
  }, [file, router.query?.file, router.query?.editedFile]);

  const loadImageCover = useCallback(async () => {
    if (
      !file ||
      !imagesFormat.includes(file.internal_type) ||
      // @NOTE: this two checks fir filename exists because sometimes OS do not pass file.type correctly
      !imagesFormat.includes(
        file.filename.slice(-3).toUpperCase() as InternalFileType
      ) ||
      !imagesFormat.includes(
        file.filename.slice(-4).toUpperCase() as InternalFileType
      )
    ) {
      return;
    }
    const fileUrl = await (async () => {
      if (router.query?.file) {
        return router.query.editedFile === "true"
          ? API.files.editedFile(router.query.file as string).then((r) => r.url)
          : API.files
              .downloadFile(router.query.file as string)
              .then((r) => r.url);
      }

      return API.files.downloadFile(file.id).then((r) => r.url);
    })();

    setFileLink(fileUrl);
  },[file, router.query?.file, router.query?.editedFile]);


 const getKeyByValue= (value: string): PaymentPlanId | undefined => {
  return Object.keys(PaymentPlanId).find((key) => PaymentPlanId[key] === value) as PaymentPlanId;
}

  useEffect(() => {
    if (user?.subscription !== null) {
      router.push(`${PAGE_LINKS.DASHBOARD}`);
    }

    if (!user?.email) {
      router.back();

      return;
    }

    if (user?.email !== null) {
      return;
    }

    if (router.query?.token) {
      API.auth.byEmailToken(router.query.token as string);
    }
  }, [user?.subscription, user?.email, router.query?.token]);

  // @NOTE: analytics on page rendered
  useEffect(() => {
    if (!localStorage.getItem("select_plan_view")) {
      console.log("send event analytic3");
    }

    localStorage.setItem("select_plan_view", "true");

    return () => {
      localStorage.removeItem("select_plan_view");
    };
  }, []);

  useEffect(() => {
    API.files.getFiles().then((res) => {
      if (router.query?.file) {
        const chosenFile = res.files.find(
          (item) => item.id === router.query!.file
        );

        setFile(chosenFile);

        return;
      }
      setFile(res.files[res.files.length - 1]);
    });
  }, []);

  // @NOTE: setting pre-select plan for users from remarketing emails
  useEffect(() => {
    if (router.query?.fromEmail === "true") {
      setSelectedPlan(PaymentPlanId.MONTHLY_FULL_SECOND_EMAIL);
      return;
    }
  }, [abTests]);

  // @NOTE: generating cover for pdf-documents
  useEffect(() => {
    loadPdfCover();
    loadImageCover();
  }, [loadImageCover, loadPdfCover]);

  const getPlans = (t: (key: string) => string): Plan[] => {
    const getTrialFormattedPrice = (price: number, currency: string) => {
      if (currency === "USD") {
        return `$${price / 100}`;
      }

      if (currency === "GBP") {
        return `£${price / 100}`;
      }

      return `€${price / 100}`;
    };

    const getAnnualFormattedPrice = ({ price, currency }: { price: number, currency: string }) => {
      if (currency === "USD") {
        return `$${(price / 100 / 12).toFixed(2)}`;
      }
      if (currency === "GBP") {
        return `$${(price / 100 / 12).toFixed(2)}`;
      }
      return `€${(price / 100 / 12).toFixed(2)}`;
    };

    const getCurrency = (currency: string) => {
      if (currency === "USD") {
        return "$";
      }

      if (currency === "GBP") {
        return "£";
      }

      return "€";
    };


    return products.map((product) => {
      const id = product?.name as PaymentPlanId;
      const titleKey = getKeyByValue(id).toLowerCase();

      const createBullets = (titleKey: string) => {
        const bullets: Bullets[] = [];
        for (let i = 1; i <= 8; i++) {
          if (i >= 4 && titleKey === "monthly") {
            bullets.push({
              imgSrc: cross,
              bullText: (
                <span className="text-[#878787]">{t(`payment_page.plans.${titleKey}.bullet${i}`)}</span>
              ),
            });
          } else {
            bullets.push({
            imgSrc: check,
            bullText: (
              <span>{t(`payment_page.plans.${titleKey}.bullet${i}`)}</span>
            ),
            });
          }
        }
        return bullets;
      }

  return {
    id,
    title: t(`payment_page.plans.${titleKey}.title`),
    price: titleKey=== 'annual'? getAnnualFormattedPrice(product?.price) : getTrialFormattedPrice(product?.price?.trial_price!, product?.price?.currency),
    fullPrice: getTrialFormattedPrice(product?.price?.price, product?.price?.currency),
    formattedCurrency: getCurrency(product?.price?.currency),
    date: titleKey=== 'annual'? t(`payment_page.plans.${titleKey}.date`): null,
    bullets: createBullets(titleKey),
       // @ts-ignore≠
     text: t(`payment_page.plans.${titleKey}.text`, {
          formattedPrice: getTrialFormattedPrice(
             product?.price?.price,
           product?.price?.currency
        ),    }),
  };
});
  };

  return {
    selectedPlan,
    onSelectPlan,
    onContinue,
    onCommentsFlip,

    imagePDF: imagePDF ? imagePDF : null,
    isImageLoading,
    fileName: file ? file.filename : null,
    fileType: file ? file.internal_type : null,
    fileLink,
    isEditorFlow:
      (router.query?.source === "editor" ||
        router.query?.source === "account") &&
      router.query.convertedFrom === undefined,
    isSecondEmail: router.query?.fromEmail === "true",
    isThirdEmail: router.query?.fromEmail === "true",

    isRemoteConfigLoading,

    getPlans,
    isPlansLoading: products.length === 0,
  };
};
