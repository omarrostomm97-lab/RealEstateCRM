import { CloseIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import Spinner from "components/spinner/Spinner";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApi, postApi, putApi } from "services/api";
import * as yup from "yup";

const initialOwnerValues = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  nationalId: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  payoutMethod: "bank_transfer",
  commissionType: "percentage",
  commissionValue: 0,
  payoutSchedule: "",
  notes: "",
};

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter a valid email"),
  commissionValue: yup
    .number()
    .typeError("Commission value must be a number")
    .min(0, "Commission value cannot be negative"),
});

const Section = ({ title, description, children }) => {
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const subtleText = useColorModeValue("secondaryGray.600", "gray.400");

  return (
    <Box border="1px solid" borderColor={borderColor} borderRadius="12px" p={4}>
      <Box mb={4}>
        <Heading size="sm" color="secondaryGray.900" mb={1}>
          {title}
        </Heading>
        {description && (
          <Text color={subtleText} fontSize="sm">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  );
};

const FieldError = ({ children }) => (
  <Text color="red.500" fontSize="xs" minH="18px" mt={1}>
    {children}
  </Text>
);

const OwnerForm = (props) => {
  const { isOpen, onClose, selectedId, mode, onSaved } = props;
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const subtleText = useColorModeValue("secondaryGray.600", "gray.400");
  const footerBorder = useColorModeValue("gray.200", "whiteAlpha.100");
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  const formik = useFormik({
    initialValues: initialOwnerValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: () => {
      saveOwner();
    },
  });

  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
  } = formik;

  const closeForm = () => {
    setError("");
    resetForm();
    onClose();
  };

  const fetchOwner = useCallback(async () => {
    if (!selectedId || !isOpen || mode !== "edit") return;

    try {
      setIsLoding(true);
      setError("");
      const response = await getApi("api/owner/view/", selectedId);
      if (response?.status === 200) {
        setValues({
          ...initialOwnerValues,
          ...response?.data,
          commissionValue: response?.data?.commissionValue || 0,
        });
      } else {
        setError(response?.response?.data?.message || "Failed to load owner.");
      }
    } catch (e) {
      setError(e?.message || "Failed to load owner.");
    } finally {
      setIsLoding(false);
    }
  }, [isOpen, mode, selectedId, setValues]);

  const saveOwner = async () => {
    try {
      setIsLoding(true);
      setError("");

      const payload = {
        ...values,
        commissionValue: Number(values?.commissionValue || 0),
      };

      const response =
        mode === "edit"
          ? await putApi(`api/owner/edit/${selectedId}`, payload)
          : await postApi("api/owner/add", { ...payload, createBy: userId });

      if (response?.status === 200) {
        onSaved();
        closeForm();
      } else {
        const message =
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to save owner.";
        setError(message);
        toast.error(message);
      }
    } catch (e) {
      const message = e?.message || "Failed to save owner.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  useEffect(() => {
    if (isOpen && mode === "add") {
      resetForm();
      setError("");
    }
  }, [isOpen, mode, resetForm]);

  return (
    <Drawer isOpen={isOpen} size="xl" onClose={closeForm}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={4}>
            <Box>
              <Heading size="md" color="secondaryGray.900">
                {mode === "edit" ? "Edit Owner" : "Add Owner"}
              </Heading>
              <Text color={subtleText} fontSize="sm" mt={1}>
                Keep contact, payout, and commission details organized.
              </Text>
            </Box>
            <IconButton
              aria-label="Close owner form"
              onClick={closeForm}
              icon={<CloseIcon />}
              size="sm"
            />
          </Box>
        </DrawerHeader>
        <DrawerBody pb={6}>
          {error && (
            <Alert status="error" mb={4} borderRadius="8px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {isLoding && mode === "edit" ? (
            <Spinner />
          ) : (
            <Stack spacing={4}>
              <Section
                title="Basic Information"
                description="Identify the owner record and official reference details."
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <FormLabel display="flex" fontSize="sm" fontWeight="600">
                      Name<Text color="red.500">*</Text>
                    </FormLabel>
                    <Input
                      name="name"
                      value={values?.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Owner full name"
                      borderColor={
                        errors?.name && touched?.name ? "red.300" : null
                      }
                    />
                    <FieldError>
                      {errors?.name && touched?.name && errors?.name}
                    </FieldError>
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      National ID
                    </FormLabel>
                    <Input
                      name="nationalId"
                      value={values?.nationalId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="National ID or tax reference"
                    />
                  </Box>
                </SimpleGrid>
              </Section>

              <Section
                title="Contact Details"
                description="Save the best ways to reach this owner."
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Phone
                    </FormLabel>
                    <Input
                      name="phone"
                      value={values?.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Primary phone number"
                    />
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      WhatsApp
                    </FormLabel>
                    <Input
                      name="whatsapp"
                      value={values?.whatsapp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="WhatsApp number"
                    />
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Email
                    </FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={values?.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="owner@example.com"
                      borderColor={
                        errors?.email && touched?.email ? "red.300" : null
                      }
                    />
                    <FieldError>
                      {errors?.email && touched?.email && errors?.email}
                    </FieldError>
                  </Box>
                </SimpleGrid>
              </Section>

              <Section
                title="Payout Details"
                description="Track how owner payouts should be handled."
              >
                <Stack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <FormLabel fontSize="sm" fontWeight="600">
                        Preferred Payout Method
                      </FormLabel>
                      <Select
                        name="payoutMethod"
                        value={values?.payoutMethod}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="wallet">Wallet</option>
                        <option value="other">Other</option>
                      </Select>
                    </Box>

                    <Box>
                      <FormLabel fontSize="sm" fontWeight="600">
                        Payout Schedule
                      </FormLabel>
                      <Input
                        name="payoutSchedule"
                        value={values?.payoutSchedule}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Monthly, after checkout, custom"
                      />
                    </Box>
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box>
                      <FormLabel fontSize="sm" fontWeight="600">
                        Bank Name
                      </FormLabel>
                      <Input
                        name="bankName"
                        value={values?.bankName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Bank name"
                      />
                    </Box>

                    <Box>
                      <FormLabel fontSize="sm" fontWeight="600">
                        Bank Account Name
                      </FormLabel>
                      <Input
                        name="bankAccountName"
                        value={values?.bankAccountName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Account holder name"
                      />
                    </Box>

                    <Box>
                      <FormLabel fontSize="sm" fontWeight="600">
                        Bank Account
                      </FormLabel>
                      <Input
                        name="bankAccountNumber"
                        value={values?.bankAccountNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Account number or IBAN"
                      />
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Section>

              <Section
                title="Commission Settings"
                description="Define how management fees or owner commissions are calculated."
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Commission Type
                    </FormLabel>
                    <Select
                      name="commissionType"
                      value={values?.commissionType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                      <option value="none">None</option>
                    </Select>
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600">
                      Commission Value
                    </FormLabel>
                    <Input
                      name="commissionValue"
                      type="number"
                      value={values?.commissionValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      borderColor={
                        errors?.commissionValue && touched?.commissionValue
                          ? "red.300"
                          : null
                      }
                    />
                    <FieldError>
                      {errors?.commissionValue &&
                        touched?.commissionValue &&
                        errors?.commissionValue}
                    </FieldError>
                  </Box>
                </SimpleGrid>
              </Section>

              <Section title="Notes" description="Add internal context for your team.">
                <Textarea
                  name="notes"
                  value={values?.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Internal notes, payout preferences, or special instructions"
                  minH="110px"
                />
              </Section>
            </Stack>
          )}
        </DrawerBody>
        <DrawerFooter borderTop="1px solid" borderColor={footerBorder}>
          <Button variant="outline" mr={3} onClick={closeForm}>
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={handleSubmit}
            isDisabled={isLoding}
          >
            {isLoding ? <Spinner /> : "Save"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default OwnerForm;
